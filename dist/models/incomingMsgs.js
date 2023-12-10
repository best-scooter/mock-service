"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonschema_1 = require("jsonschema");
const jet_logger_1 = __importDefault(require("jet-logger"));
const server_1 = require("../server");
const messageData_1 = require("../jsonschemas/messageData");
const apiRequests_1 = require("./apiRequests");
const systemState_1 = require("./systemState");
const outgoingMsgs_1 = require("./outgoingMsgs");
const EnvVars_1 = __importDefault(require("../constants/EnvVars"));
function _arrangeRoute(data, state) {
    const arrangedData = Object.assign({}, data);
    if (arrangedData.message === "trip" &&
        Array.isArray(arrangedData.routeAppend)) {
        if (!(Array.isArray(state.route))) {
            state.route = [];
        }
        arrangedData.route = state.route.concat(arrangedData.routeAppend);
        delete arrangedData.routeAppend;
    }
    return arrangedData;
}
function subscribe(data, client) {
    if (!((0, jsonschema_1.validate)(data, messageData_1.dataSubscribeSchema).valid)) {
        return;
    }
    for (const subscription of data.subscriptions) {
        server_1.clientStore.addSubscribed(client, subscription);
    }
    if (data.subscriptions.includes("scooter")) {
        (0, outgoingMsgs_1.sendAllScooters)(client);
    }
    if (data.subscriptions.includes("scooterLimited")) {
        (0, outgoingMsgs_1.sendAllScootersLimited)(client);
    }
    if (data.subscriptions.includes("customer")) {
        (0, outgoingMsgs_1.sendAllCustomers)(client);
    }
    if (data.subscriptions.includes("trip")) {
        (0, outgoingMsgs_1.sendAllTrips)(client);
    }
}
function receiveScooter(data, client) {
    if (!((0, jsonschema_1.validate)(data, messageData_1.dataScooterSchema).valid)) {
        jet_logger_1.default.warn("Received invalid update data: " + data +
            " from client: " + client.info);
        return;
    }
    (0, outgoingMsgs_1.sendScooter)(data);
    (0, apiRequests_1.putScooter)(data.scooterId, data, client.token);
    systemState_1.systemState.addClientData("scooters", data);
}
function receiveCustomer(data, client) {
    if (!((0, jsonschema_1.validate)(data, messageData_1.dataCustomerSchema).valid)) {
        jet_logger_1.default.warn("Received invalid update data: " + data +
            " from client: " + client.info);
        return;
    }
    (0, apiRequests_1.putCustomer)(data.scooterId, data, client.token);
    (0, outgoingMsgs_1.sendCustomer)(data);
    systemState_1.systemState.addClientData("customers", data);
}
function receiveTrip(data, client) {
    if (!((0, jsonschema_1.validate)(data, messageData_1.dataTripSchema).valid)) {
        jet_logger_1.default.warn("Received invalid update data: " + data +
            " from client: " + client.info);
        return;
    }
    (0, apiRequests_1.putTrip)(data.tripId, data, client.token);
    const tripState = systemState_1.systemState.getState("trips")[data.tripId];
    const arrangedData = _arrangeRoute(data, tripState);
    (0, outgoingMsgs_1.sendTrip)(arrangedData);
    systemState_1.systemState.addClientData("trips", arrangedData);
}
function receiveTripStart(data, client) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!((0, jsonschema_1.validate)(data, messageData_1.dataTripStartSchema).valid)) {
            jet_logger_1.default.warn("Received invalid update data: " + data +
                " from client: " + client.info);
            return;
        }
        const position = yield (0, apiRequests_1.getScooterPosition)(data.scooterId);
        const arrangedData = {
            tripId: 0,
            scooterId: data.scooterId,
            customerId: data.customerId,
            startPosition: position,
            priceInitial: EnvVars_1.default.PriceInitial,
            priceTime: EnvVars_1.default.PriceTime,
            priceDistance: EnvVars_1.default.PriceDistance
        };
        const postResult = yield (0, apiRequests_1.postTrip)(arrangedData, client.token);
        const tripId = postResult.tripId;
        const tripData = yield (0, apiRequests_1.getTrip)(tripId);
        (0, outgoingMsgs_1.sendTrip)(tripData);
        (0, outgoingMsgs_1.sendTripStart)(client, postResult);
        systemState_1.systemState.addClientData("trips", tripData);
    });
}
function receiveTripEnd(data, client) {
    if (!((0, jsonschema_1.validate)(data, messageData_1.dataTripEndSchema).valid)) {
        jet_logger_1.default.warn("Received invalid update data: " + data +
            " from client: " + client.info);
        return;
    }
    const tripId = data.tripId;
    const now = new Date().toJSON();
    console.log(tripId);
    console.log(now);
    (0, apiRequests_1.putTrip)(tripId, {
        timeEnded: now
    }, client.token);
    (0, outgoingMsgs_1.sendTrip)({
        trip: tripId,
        remove: true
    });
    systemState_1.systemState.removeClientData("trips", tripId);
}
exports.default = {
    subscribe,
    receiveScooter,
    receiveCustomer,
    receiveTrip,
    receiveTripStart,
    receiveTripEnd
};
