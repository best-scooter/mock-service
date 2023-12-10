import { Message } from "websocket";
import logger from 'jet-logger';
import { connection } from 'websocket';
import { validate } from "jsonschema";

import incomingMsgs from "./incomingMsgs";
import messageData from "../jsonschemas/messageData";
import Client from "../classes/Scooter";

// **** Variables **** //

// **** Helper functions **** //

function _messageParser(message: Message, conn: connection) {
    if (message.type === 'binary') {
        conn.sendUTF('Unable to parse binary message.')
        logger.warn('Unable to parse binary message.');

        return null;
    };

    let data;

    try {
        data = JSON.parse(message.utf8Data);
    } catch {
        logger.warn('Unable to parse message: ' + message.utf8Data);
        conn.sendUTF('Unable to parse message: ' + message.utf8Data);
    }

    if (validate(data, messageData.dataSchema)) {
        // conn.sendUTF('Parsed message: ' + JSON.stringify(data));
        return data;
    }

    logger.warn('Message of unknown structure: ' + JSON.stringify(data));
    conn.sendUTF('Message of unknown structure: ' + JSON.stringify(data));
    return null;
}

// **** Functions **** //

function messageRouter(client: Client) {
    client.connection.on('message', (message) => {
        const data = _messageParser(message, client.connection);

        if (!data) { return; }

        switch (data.message) {
            case "scooter":
                incomingMsgs.receiveScooter(data, client);
                break;
            default:
                client.connection.sendUTF("Unknown message.");
        }
    });
}

// **** Exports **** //

export { messageRouter };
