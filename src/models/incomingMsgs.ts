import { validate } from "jsonschema";
import logger from 'jet-logger';

import { clientStore } from "../server";
import {
    dataSubscribeSchema,
    dataScooterSchema,
    dataCustomerSchema,
    dataTripSchema,
    dataTripStartSchema,
    dataTripEndSchema
} from "../jsonschemas/messageData";
import Client from "../classes/Client";
import {
    putCustomer,
    putScooter,
    putTrip,
    getTrip,
    getScooterPosition,
    postTrip
} from './apiRequests'
import { adminJwt, systemState } from "./systemState";
import {
    sendScooter,
    sendCustomer,
    sendTrip,
    sendAllScooters,
    sendAllScootersLimited,
    sendAllCustomers,
    sendAllTrips,
    sendTripStart
} from "./outgoingMsgs";
import { MessageData } from "../types/MessageData";
import { TripState } from "../types/ClientStates";
import EnvVars from "../constants/EnvVars";

// **** Variables **** //

// **** Helper functions **** //

function _arrangeRoute(data: MessageData, state: TripState) {
    const arrangedData: MessageData = {
        ...data
    };
    if (
        arrangedData.message === "trip" &&
        Array.isArray(arrangedData.routeAppend)
    ) {
        if (!(Array.isArray(state.route))) {
            state.route = [];
        }

        arrangedData.route = state.route.concat(arrangedData.routeAppend)
        delete arrangedData.routeAppend;
    }

    return arrangedData;
}

// **** Functions **** //

function subscribe(data: any, client: Client) {
    if (!(validate(data, dataSubscribeSchema).valid)) { return; }

    for (const subscription of data.subscriptions) {
        clientStore.addSubscribed(client, subscription);
    }

    if (data.subscriptions.includes("scooter")) {
        sendAllScooters(client);
    }
    
    if (data.subscriptions.includes("scooterLimited")) {
        sendAllScootersLimited(client);
    }
    
    if (data.subscriptions.includes("customer")) {
        sendAllCustomers(client);
    }
    
    if (data.subscriptions.includes("trip")) {
        sendAllTrips(client);
    }
}

function receiveScooter(data: any, client: Client) {
    if (!(validate(data, dataScooterSchema).valid)) {
        logger.warn(
            "Received invalid update data: " + data +
            " from client: " + client.info
        );
        return;
    }

    sendScooter(data);
    putScooter(data.scooterId, data, client.token);
    systemState.addClientData("scooters", data);
}

function receiveCustomer(data: any, client: Client) {
    if (!(validate(data, dataCustomerSchema).valid)) {
        logger.warn(
            "Received invalid update data: " + data +
            " from client: " + client.info
        );
        return;
    }

    putCustomer(data.scooterId, data, client.token);
    sendCustomer(data);
    systemState.addClientData("customers", data);
}

function receiveTrip(data: any, client: Client) {
    if (!(validate(data, dataTripSchema).valid)) {
        logger.warn(
            "Received invalid update data: " + data +
            " from client: " + client.info
        );
        return;
    }

    putTrip(data.tripId, data, client.token);

    const tripState = systemState.getState("trips")[data.tripId];
    const arrangedData = _arrangeRoute(data as MessageData, tripState as TripState);

    sendTrip(arrangedData);
    systemState.addClientData("trips", arrangedData);
}

async function receiveTripStart(data: any, client: Client) {
    if (!(validate(data, dataTripStartSchema).valid)) {
        logger.warn(
            "Received invalid update data: " + data +
            " from client: " + client.info
        );
        return;
    }

    const position = await getScooterPosition(data.scooterId);
    const arrangedData = {
        tripId: 0,
        scooterId: data.scooterId,
        customerId: data.customerId,
        startPosition: position,
        priceInitial: EnvVars.PriceInitial,
        priceTime: EnvVars.PriceTime,
        priceDistance: EnvVars.PriceDistance
    };
    const postResult = await postTrip(arrangedData, client.token);
    const tripId = postResult.tripId;
    const tripData = await getTrip(tripId);

    sendTrip(tripData);
    sendTripStart(client, postResult);
    systemState.addClientData("trips", tripData);
}

function receiveTripEnd(data: any, client: Client) {
    if (!(validate(data, dataTripEndSchema).valid)) {
        logger.warn(
            "Received invalid update data: " + data +
            " from client: " + client.info
        );
        return;
    }

    const tripId = data.tripId;
    const now = new Date().toJSON()

    console.log(tripId)
    console.log(now)

    putTrip(
        tripId,
        {
            timeEnded: now
        },
        client.token
    );
    sendTrip({
        trip: tripId,
        remove: true
    })
    systemState.removeClientData("trips", tripId);
}

// **** Exports **** //

export default {
    subscribe,
    receiveScooter,
    receiveCustomer,
    receiveTrip,
    receiveTripStart,
    receiveTripEnd
};
