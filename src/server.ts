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
import zoneStore from './models/zoneStore';

// // **** Setup **** //

const httpServer = http.createServer(function (request, response) {
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
    logger.info(`Successfully connected ${clientStore.customers.length} customers and a ${EnvVars.RefreshDelay}ms refresh frequency.`);
    await customerSystem.createFakeScooters(10);
    await customerSystem.initiate(clientStore);
    const simpleAmount = EnvVars.NrOfCustomers - EnvVars.NrOfSmartCustomers - EnvVars.NrOfPreparedCustomers
    logger.info(`Started ${EnvVars.NrOfSmartCustomers} smart, ${EnvVars.NrOfPreparedCustomers} prepared and ${simpleAmount} simple customers with a x${EnvVars.SpeedMultiplier} speed multiplier.`);
});

zoneStore.populate();

wsServer.on('request', requestHandler);

// // **** Export default **** //

export { httpServer, wsServer, clientStore, adminToken };
