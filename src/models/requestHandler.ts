import { Message, request } from 'websocket'
import logger from 'jet-logger'

import { requestVerification } from './requestVerification';
import { messageRouter } from './messageRouter';
import { clientStore } from '../server';
import Client from '../classes/Client';
import { systemState } from './systemState';
import { sendScooter, sendCustomer } from './outgoingMsgs';

// **** Variables **** //

// **** Helper functions **** //

function _onAllMessages(message: Message) {
    if (message.type === 'utf8') {
        logger.info('Received Message: ' + message.utf8Data);
    }
    else if (message.type === 'binary') {
        logger.info('Received Binary Message of ' + message.binaryData.length + ' bytes');
    }
}

function _onClose(this: {client: Client}) {
    const scooterId = this.client.info.scooterId;
    const customerId = this.client.info.customerId;

    if (this.client.type === "scooter" && typeof scooterId === "number") {
        systemState.removeClientData("scooters", scooterId);
        sendScooter({
            message: "scooter",
            scooterId,
            remove: true
        });
    } else if (this.client.type === "customer" && typeof customerId === "number") {
        systemState.removeClientData("customers", customerId);
        sendCustomer({
            message: "customer",
            customerId,
            remove: true
        });
    }

    // remove client from the client store
    clientStore.remove(this.client);
    logger.info('Peer ' + this.client.connection.remoteAddress + ' disconnected.');
}

// **** Functions **** //

function requestHandler(request: request) {
    // passing the JWT through the protocol
    // a bit iffy but what can you do
    const token = Object.values(request.protocolFullCaseMap)[0];

    if (!requestVerification(token)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        logger.info('Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    const conn = request.accept(null, request.origin);
    const client = new Client(conn, token);

    // Add the client to the client store
    clientStore.add(client);
    logger.info('Connection ' + conn.remoteAddress + ' accepted.');
    // conn.on('message', _onAllMessages);
    conn.on('close', _onClose.bind({client}));

    // Main function to set up message logic
    messageRouter(client);
}

// **** Exports **** //

export { requestHandler };
