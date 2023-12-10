import logger from "jet-logger";

import { clientStore } from "../server";
import Scooter from "../classes/Scooter";

// **** Variables **** //

// **** Helper functions **** //

function _sendToAllScooters(message: string) {
    logger.info(`Sending all scooters message: ${message}`);

    for (const scooter of clientStore.scooters) {
        scooter.connection.send(message);
    }
}

function _sendToAllCustomers(message: string) {
    logger.info(`Sending all customers message: ${message}`);

    for (const customer of clientStore.customers) {
        customer.connection.send(message);
    }
}

function _sendToScooter(scooterId: number, message: string) {
    logger.info(`Sending scooter ${scooterId} message: ${message}`);

    for (const scooter of clientStore.scooters) {
        if (scooter.scooterId === scooterId) {
            scooter.connection.send(message);
        }
    }
}

function _sendToCustomer(customerId: number, message: string) {
    logger.info(`Sending customer ${customerId} message: ${message}`);

    for (const customer of clientStore.customers) {
        if (customer.customerId === customerId) {
            customer.connection.send(message);
        }
    }
}

// **** Functions **** //

function sendScooter(data: any) {
    const message = JSON.stringify(data);
    _sendToAllScooters(message);
}

// **** Exports **** //

export default {
    sendScooter
};
