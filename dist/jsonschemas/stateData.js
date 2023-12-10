"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tripStateSchema = exports.customerStateSchema = exports.scooterStateSchema = void 0;
const scooterStateSchema = {
    "id": "/StateDataCustomer",
    "type": "object",
    "properties": {
        "id": { "type": "number" },
        "scooterId": { "type": "number" },
        "positionX": { "type": "number" },
        "positionY": { "type": "number" },
        "battery": { "type": "number" },
        "charging": { "type": "boolean" },
        "available": { "type": "boolean" },
        "decomissioned": { "type": "boolean" },
        "beingServiced": { "type": "boolean" },
        "disabled": { "type": "boolean" }
    },
    "required": ["scooterId"]
};
exports.scooterStateSchema = scooterStateSchema;
const customerStateSchema = {
    "id": "/StateDataScooter",
    "type": "object",
    "properties": {
        "id": { "type": "number" },
        "customerId": { "type": "number" },
        "positionX": { "type": "number" },
        "positionY": { "type": "number" }
    },
    "required": ["customerId"]
};
exports.customerStateSchema = customerStateSchema;
const tripStateSchema = {
    "id": "/StateDataAdmin",
    "type": "object",
    "properties": {
        "scooterId": { "type": "number" },
        "customerId": { "type": "number" },
        "id": { "type": "number" },
        "tripId": { "type": "number" },
        "timeStarted": { "type": "string" },
        "timeEnded": { "type": ["string", "null"] },
        "distance": { "type": ["number", "null"] },
        "route": {
            "type": "array",
            "items": {
                "type": "array",
                "items": {
                    "type": "number"
                }
            }
        }
    },
    "required": ["scooterId", "tripId", "customerId"]
};
exports.tripStateSchema = tripStateSchema;
