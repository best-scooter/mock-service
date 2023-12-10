// /**
//  * Setup server.
//  */

import WebSocket from 'websocket';
import http from 'http';
import logger from 'jet-logger';

import ClientStore from './classes/ClientStore';
import { requestHandler } from './models/requestHandler';

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

// // **** Export default **** //

export { httpServer, wsServer, clientStore };
