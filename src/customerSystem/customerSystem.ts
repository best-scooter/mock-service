import WebSocket from 'websocket';
import logger from 'jet-logger';
import randomPointsOnPolygon from 'random-points-on-polygon';
import { polygon } from '@turf/helpers';

import EnvVars from "../constants/EnvVars";
import Customer from '../classes/Customer';
import ClientStore from '../classes/ClientStore';
import apiRequests from '@src/models/apiRequests';

export default {
    populate: async function(clientStore: ClientStore) {
        const promises: Array<Promise<any>> = []

        for (let i = 0; i < EnvVars.NrOfCustomers; i++) {
            const customerId = i + 1;
            const promise = new Promise(async (resolve, reject) => {
                const response = await fetch(EnvVars.ApiHost + "v1/customer/token", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: "customer" + customerId + "@test.com"
                    })
                });
                const json = await response.json()
                const token = json.data.token;
                const wsClient = new WebSocket.client();

                wsClient.connect(EnvVars.WsHost, undefined, undefined, {
                    "sec-websocket-protocol": token
                });
                wsClient.on('connect', (connection) => {
                    const customer = new Customer(connection, token)
                    clientStore.addCustomer(customer);

                    connection.on('error', function(error) {
                        logger.warn("Connection Error: " + error.toString());
                    });
                    resolve(true)
                })

                wsClient.on('connectFailed', function(error) {
                    logger.warn('Connect Error: ' + error.toString());
                });
            })

            promises.push(promise)
        }

        return await Promise.all(promises);
    },

    _getCityFeature: async function(zoneId: number) {
        const cityZone = await apiRequests.getZone(zoneId);
        const cityPolygon = [cityZone.area.concat(cityZone.area[0])];
        return polygon(cityPolygon);
    },

    initiate: async function(clientStore: ClientStore) {
        const customers = clientStore.customers;
        // använder zoneId 7 för göteborg
        const cityFeature = await this._getCityFeature(7);
        const pointFeatures = randomPointsOnPolygon(customers.length, cityFeature)
        const points: Array<Array<number>> = [];

        for (const pointFeature of Object.values(pointFeatures)) {
            points.push(pointFeature.geometry.coordinates);
        }

        for (let i = 0; i < customers.length; i++) {
            const customer = customers[i];
            const startPosition = points[i];

            customer.position = startPosition;
            apiRequests.putCustomer(
                customer.customerId,
                {
                    positionX: startPosition[0],
                    positionY: startPosition[1]
                }, 
                customer.token
            )
        }
    }
}