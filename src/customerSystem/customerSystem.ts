import WebSocket from 'websocket';
import logger from 'jet-logger';
import * as turf from '@turf/turf';

import EnvVars from "../constants/EnvVars";
import Customer from '../classes/Customer';
import Scooter from '../classes/Scooter';
import ClientStore from '../classes/ClientStore';
import apiRequests from '../models/apiRequests';
import { clientStore } from '../server';
import SmartCustomerStrategy from '../classes/SmartCustomerStrategy';
import SimpleCustomerStrategy from '../classes/SimpleCustomerStrategy';
import PreparedCustomerStrategy from '../classes/PreparedCustomerStrategy';
import helpers from '../utils/helpers';
import zoneStore from '../models/zoneStore';
import CustomerStrategy from '../classes/CustomerStrategy';
import PreparedScooterStrategy from '../classes/PreparedScooterStrategy';
import ScooterStrategy from '../classes/ScooterStrategy';
import SimpleScooterStrategy from '../classes/SimpleScooterStrategy';

export default {
    /**
     * Populates the client store with the number of customers
     * determined from env variable.
     * @param {ClientStore} clientStore
     * @returns {Promise<Array<Boolean>>}
     */
    populate: async function (clientStore: ClientStore) {
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

                    connection.on('error', function (error) {
                        logger.warn("Connection Error: " + error.toString());
                    });
                    resolve(true)
                })

                wsClient.on('connectFailed', function (error) {
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
    _getCityFeature: async function (zoneId: number) {
        const cityZone = await apiRequests.getZone(zoneId);
        const cityPolygon = [cityZone.area.concat(cityZone.area[0])];
        return turf.polygon(cityPolygon);
    },

    /**
     * Initiate all customers decision strategy,
     * including setting start position in a random location
     * @param {ClientStore} clientStore Client store with the customers to initiate
     */
    initiate: async function (clientStore: ClientStore) {
        const customers = clientStore.customers;
        const points: Array<[number, number]> = [];

        // Use zoneId 7 for Göteborg or 8 for downtown Göteborg
        const zoneIds = [8]

        for (const zoneId of zoneIds) {
            // Divide amount of customers by amount of cities
            // to evenly distribute customers in all cities
            const pointAmount = Math.ceil(customers.length / zoneIds.length)

            const zone = zoneStore.getZone(zoneId);

            for (const point of helpers.getRandomPositions(zone, pointAmount)) {
                points.push(point)
            }
        }

        // Initiate each customer
        for (let i = 0; i < customers.length; i++) {
            // Get random point and use as start position for the customer
            const startPosition = points[i];
            const customer = customers[i]
            customer.position = startPosition;

            // Put the position in the database
            apiRequests.putCustomer(
                customer.customerId,
                {
                    positionY: startPosition[0],
                    positionX: startPosition[1]

                },
                customer.token
            );

            // Initiate decision making strategy
            let strategy: CustomerStrategy;
            const smartAmount = EnvVars.NrOfSmartCustomers;
            const preparedAmount = EnvVars.NrOfPreparedCustomers;

            if (customer.customerId <= smartAmount) {
                strategy = new SmartCustomerStrategy(customer)
            } else if (customer.customerId <= smartAmount + preparedAmount) {
                strategy = new PreparedCustomerStrategy(customer)
            } else {
                strategy = new SimpleCustomerStrategy(customer);
            }

            // strategy = new PreparedCustomerStrategy(customer);

            const stagger = Math.random() * EnvVars.RefreshDelay;
            helpers.wait(stagger).then(() => {
                customer.initiate(strategy);
            });
        }
    },

    async createFakeScooters(amount: number, position: [number, number]) {
        const thisZone = zoneStore.getCommercialZone(position)
        const positions = helpers.getRandomPositions(thisZone, amount + 1)

        for (let i = 1; i <= amount; i++) {
            this._createFakeScooter(i, positions[i])
        }
    },

    async _createFakeScooter (scooterId: number, position: [number, number]) {
        const result = await apiRequests.postScooterToken(
            scooterId, scooterId.toString()
        );
        const token = result.data.token;
        const scooterWs = new WebSocket.client();

        scooterWs.connect(EnvVars.WsHost, undefined, undefined, {
            "sec-websocket-protocol": token
        });

        scooterWs.on('connect', (connection) => {
            const scooter = new Scooter(connection, token, position)
            let strategy: ScooterStrategy;

            clientStore.addScooter(scooter);

            if (
                scooterId > EnvVars.NrOfStationaryScooters &&
                scooterId <= EnvVars.NrOfPreparedScooters
            ) {
                strategy = new PreparedScooterStrategy(scooter)
                scooter.initiate(strategy);
            } else if (
                scooterId > (EnvVars.NrOfStationaryScooters + EnvVars.NrOfPreparedScooters)
            ) {
                strategy = new SimpleScooterStrategy(scooter)
                scooter.initiate(strategy);
            }

            apiRequests.delParking(scooter.scooterId, scooter.token).then(() => {
                apiRequests.postParking(scooter.scooterId, scooter.position, scooter.token);
            }).catch((error) => {
                logger.err(error);
                apiRequests.postParking(scooter.scooterId, scooter.position, scooter.token);
            })

            connection.on('error', function (error) {
                logger.warn("Connection Error: " + error.toString());
            });
        })

        scooterWs.on('connectFailed', function (error) {
            logger.warn('Connect Error: ' + error.toString());
        });
    }
}
