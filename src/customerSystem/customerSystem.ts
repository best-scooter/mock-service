import WebSocket from 'websocket';
import logger from 'jet-logger';
import randomPointsOnPolygon from 'random-points-on-polygon';
import { point, polygon } from '@turf/helpers';

import EnvVars from "../constants/EnvVars";
import Customer from '../classes/Customer';
import ClientStore from '../classes/ClientStore';
import apiRequests from '@src/models/apiRequests';

export default {
    /**
     * Populates the client store with the number of customers
     * determined from env variable.
     * @param {ClientStore} clientStore
     * @returns {Promise<Array<Boolean>>}
     */
    populate: async function(clientStore: ClientStore) {
        const promises: Array<Promise<any>> = [];

        for (let i = 0; i < EnvVars.NrOfCustomers; i++) {
            const customerId = i + 1;
            const promise = new Promise(async (resolve, reject) => {
                const result = await apiRequests.postCustomerToken(
                    "customer" + customerId + "@test.com"
                    );
                const token = result.data.token;
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

    /**
     * Get a city zone as a feature
     * @param {number} zoneId Zone id of the city zone
     * @returns {Feature}
     */
    _getCityFeature: async function(zoneId: number) {
        const cityZone = await apiRequests.getZone(zoneId);
        const cityPolygon = [cityZone.area.concat(cityZone.area[0])];
        return polygon(cityPolygon);
    },

    /**
     * Initiate all customers decision strategy,
     * including setting start position in a random location
     * @param {ClientStore} clientStore Client store with the customers to initiate
     */
    initiate: async function(clientStore: ClientStore) {
        const customers = clientStore.customers;
        const points: Array<Array<number>> = [];

        // Use zoneId 7 for Göteborg
        const cityIds = [7]

        for (const zoneId of cityIds) {
            // Get a city as a GeoJSON feature
            const cityFeature = await this._getCityFeature(zoneId);

            // Divide amount of customers by amount of cities
            // to evenly distribute customers in all cities
            const pointAmount = Math.ceil(customers.length / cityIds.length)

            // Randomise necessary amount of points inside city
            const pointFeatures = randomPointsOnPolygon(pointAmount, cityFeature)
    
            // Puts all points in a simple array
            for (const pointFeature of Object.values(pointFeatures)) {
                points.push(pointFeature.geometry.coordinates);
            }
        }

        // Initiate each customer
        for (const customer of customers) {
            // Get random point and use as start position for the customer
            const randomIndex = Math.floor(Math.random()*points.length)
            const startPosition = points[randomIndex];
            customer.position = startPosition;

            // Put the position in the database
            apiRequests.putCustomer(
                customer.customerId,
                {
                    positionX: startPosition[0],
                    positionY: startPosition[1]
                }, 
                customer.token
            );

            // Initiate decision making strategy
            customer.initiate();
        }
    }
}