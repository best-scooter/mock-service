// /**
//  * Setup server.
//  */

import WebSocket from 'websocket';
import http from 'http';
import logger from 'jet-logger';

import ClientStore from './classes/ClientStore';
import { requestHandler } from './models/requestHandler';
import EnvVars from './constants/EnvVars';
import { NodeEnvs } from './constants/misc';
import { stateInitialise, systemState } from './models/systemState';

// // **** Setup **** //

const httpServer = http.createServer(function(request, response) {
    logger.info((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
const wsServer = new WebSocket.server({
    httpServer: httpServer,
    autoAcceptConnections: false
})
const clientStore = new ClientStore();

wsServer.on('request', requestHandler);
stateInitialise();

if (EnvVars.NodeEnv === NodeEnvs.Dev.valueOf()) {
    setInterval(() => {
        logger.info(
            "Subscribers: " + clientStore.all.length +
            "\tscooter: " + clientStore.subscribed.scooter.length +
            "\tscooterLimited: " + clientStore.subscribed.scooterLimited.length +
            "\tcustomer: " + clientStore.subscribed.customer.length +
            "\ttrip:" + clientStore.subscribed.trip.length
        );

        const scooterCount = systemState.getState("scooters").slice(1).length
        const customerCount = systemState.getState("customers").slice(1).length
        const tripCount = systemState.getState("trips").slice(1).length

        logger.info(
            "Scooters: " + scooterCount +
            "\tCustomers:" + customerCount +
            "\t\tTrips:" + tripCount
        );

        // console.log(systemState.getState("scooters"));
    }, 2000);
}

// // **** Export default **** //

export { httpServer, wsServer, clientStore };
