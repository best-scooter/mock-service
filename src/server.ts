// /**
//  * Setup server.
//  */

import WebSocket, { client } from 'websocket';
import http from 'http';
import logger from 'jet-logger';

import ClientStore from './classes/ClientStore';
import { requestHandler } from './models/requestHandler';
import customerSystem from './customerSystem/customerSystem'
import EnvVars from './constants/EnvVars';
import Customer from './classes/Customer';

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
const adminToken = fetch(EnvVars.ApiHost + "v1/admin/token", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        username: EnvVars.AdminUsername,
        password: EnvVars.AdminPassword
    })
}).then((response) => {
    return response.json();
}).then((result) => {
    return result.data.token;
});

customerSystem.populate(clientStore).then(async () => {
    logger.info("Successfully connected " + clientStore.customers.length + " customers.");
    await customerSystem.createFakeScooters();
    await customerSystem.initiate(clientStore);
});

wsServer.on('request', requestHandler);

// // **** Export default **** //

export { httpServer, wsServer, clientStore, adminToken };
