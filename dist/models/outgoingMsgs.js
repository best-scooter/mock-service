"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTripStart = exports.sendAllTrips = exports.sendAllCustomers = exports.sendAllScootersLimited = exports.sendAllScooters = exports.sendTrip = exports.sendCustomer = exports.sendScooter = void 0;
const jet_logger_1 = __importDefault(require("jet-logger"));
const server_1 = require("../server");
const systemState_1 = require("./systemState");
function _send(list, message) {
    jet_logger_1.default.info(`Sending subscribers "${list}" message: ${message}`);
    for (const subscriber of server_1.clientStore._subscribed[list]) {
        subscriber.connection.send(message);
    }
}
function _sendLimitedScooter(data) {
    const limitedData = {
        message: "scooter",
        scooterId: data.scooterId
    };
    let sendLimitedData = false;
    for (const [key, value] of Object.entries(data)) {
        if (["positionX", "positionY", "battery", "remove"].includes(key)) {
            sendLimitedData = true;
            limitedData[key] = value;
        }
    }
    if (sendLimitedData) {
        const message = JSON.stringify(limitedData);
        _send("scooterLimited", message);
    }
}
function _isScooterReadyToUse(scooter) {
    return (scooter.available &&
        scooter.battery &&
        scooter.battery >= 0.5 &&
        !(scooter.beingServiced) &&
        !(scooter.charging) &&
        !(scooter.decomissioned) &&
        !(scooter.disabled));
}
function sendScooter(data) {
    const message = JSON.stringify(data);
    _send("scooter", message);
    _sendLimitedScooter(data);
}
exports.sendScooter = sendScooter;
function sendCustomer(data) {
    const message = JSON.stringify(data);
    _send("customer", message);
}
exports.sendCustomer = sendCustomer;
function sendTrip(data) {
    const message = JSON.stringify(data);
    _send("trip", message);
}
exports.sendTrip = sendTrip;
function sendAllScooters(client) {
    const scooters = systemState_1.systemState.getState("scooters").slice(1);
    for (const scooter of scooters) {
        if (scooter === undefined) {
            continue;
        }
        const message = JSON.stringify(Object.assign({ message: "scooter" }, scooter));
        client.connection.send(message);
    }
}
exports.sendAllScooters = sendAllScooters;
function sendAllScootersLimited(client) {
    const scooters = systemState_1.systemState.getState("scooters");
    for (const scooter of scooters) {
        if (scooter === undefined) {
            continue;
        }
        if (_isScooterReadyToUse(scooter)) {
            const message = JSON.stringify({
                message: "scooter",
                scooterId: scooter.scooterId,
                positionX: scooter.positionX,
                positionY: scooter.positionY,
                battery: scooter.battery
            });
            client.connection.send(message);
        }
    }
}
exports.sendAllScootersLimited = sendAllScootersLimited;
function sendAllTrips(client) {
    const trips = systemState_1.systemState.getState("trips");
    for (const trip of trips) {
        if (trip === undefined) {
            continue;
        }
        const message = JSON.stringify(Object.assign({ message: "trip" }, trip));
        client.connection.send(message);
    }
}
exports.sendAllTrips = sendAllTrips;
function sendAllCustomers(client) {
    const customers = systemState_1.systemState.getState("customers");
    for (const customer of customers) {
        if (customer === undefined) {
            continue;
        }
        const message = JSON.stringify(Object.assign({ message: "customer" }, customer));
        client.connection.send(message);
    }
}
exports.sendAllCustomers = sendAllCustomers;
function sendTripStart(client, responseBody) {
    client.connection.send(JSON.stringify({
        message: "tripStart",
        tripId: responseBody.tripId
    }));
}
exports.sendTripStart = sendTripStart;
