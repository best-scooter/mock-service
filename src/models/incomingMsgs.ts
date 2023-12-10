import { validate } from "jsonschema";
import logger from 'jet-logger';

import Client from "../classes/Scooter";
import messageData from "../jsonschemas/messageData";
import outgoingMsgs from "./outgoingMsgs";
import apiRequests from "./apiRequests";

// **** Variables **** //

// **** Helper functions **** //

// **** Functions **** //


function receiveScooter(data: any, client: Client) {
    if (!(validate(data, messageData.dataScooterSchema).valid)) {
        logger.warn(
            "Received invalid update data: " + data +
            " from client: " + client.info
        );
        return;
    }

    outgoingMsgs.sendScooter(data);
    apiRequests.putScooter(data.scooterId, data, client.token);
}

// **** Exports **** //

export default {
    receiveScooter,
};
