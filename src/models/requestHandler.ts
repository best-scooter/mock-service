import { Message, request } from 'websocket'
import logger from 'jet-logger'

import { requestVerification } from './requestVerification';
import { messageRouter } from './messageRouter';
import { clientStore } from '../server';
import Scooter from '../classes/Scooter';
import outgoingMsgs from './outgoingMsgs';

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

function _onClose(this: {scooter: Scooter}) {
    // remove scooter from the client store
    clientStore.removeScooter(this.scooter);
    logger.info('Peer ' + this.scooter.info + ' disconnected.');
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
    const scooter = new Scooter(conn, token);

    // Add the client to the client store
    clientStore.addScooter(scooter);
    logger.info('Connection ' + conn.remoteAddress + ' accepted.');
    // conn.on('message', _onAllMessages);
    conn.on('close', _onClose.bind({scooter}));

    // Main function to set up message logic
    messageRouter(scooter);
}

// **** Exports **** //

export { requestHandler };
