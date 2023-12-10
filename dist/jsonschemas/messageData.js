"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSubscribeSchema = exports.dataTripEndSchema = exports.dataTripStartSchema = exports.dataTripSchema = exports.dataScooterSchema = exports.dataCustomerSchema = exports.dataSchema = void 0;
const dataSchema = {
    "id": "/MessageData",
    "type": "object",
    "properties": {
        "message": {
            "type": "string",
            "pattern": /^(customer|scooter|trip|tripStart|tripEnd|subscribe)$/
        },
        "customerEmail": { "type": "string" },
        "customerId": { "type": "number" },
        "positionX": { "type": "number" },
        "positionY": { "type": "number" },
        "battery": { "type": "number" },
        "charging": { "type": "boolean" },
        "available": { "type": "boolean" },
        "decomissioned": { "type": "boolean" },
        "beingServiced": { "type": "boolean" },
        "disabled": { "type": "boolean" },
        "scooterId": { "type": "number" },
        "parkedCharging": { "type": "boolean" },
        "distance": { "type": "number" },
        "route": {
            "type": "array",
            "items": {
                "type": "array",
                "items": {
                    "type": "number"
                }
            }
        },
        "routeAppend": {
            "type": "array",
            "items": {
                "type": "array",
                "items": {
                    "type": "number"
                }
            }
        },
        "subscriptions": {
            "type": "array",
            "items": {
                "type": "string"
            }
        }
    },
    "required": ["message"]
};
exports.dataSchema = dataSchema;
const dataCustomerSchema = {
    "id": "/MessageDataCustomer",
    "type": "object",
    "properties": {
        "message": {
            "type": "string",
            "pattern": /^customer$/
        },
        "customerId": { "type": "number" },
        "positionX": { "type": "number" },
        "positionY": { "type": "number" }
    },
    "required": ["message", "customerId", "positionX", "positionY"]
};
exports.dataCustomerSchema = dataCustomerSchema;
const dataScooterSchema = {
    "id": "/MessageDataScooter",
    "type": "object",
    "properties": {
        "message": {
            "type": "string",
            "pattern": /^scooter$/
        },
        "scooterId": { "type": "number" },
        "positionX": { "type": "number" },
        "positionY": { "type": "number" },
        "battery": { "type": "number" },
        "charging": { "type": "boolean" },
        "available": { "type": "boolean" },
        "decomissioned": { "type": "boolean" },
        "beingServiced": { "type": "boolean" },
        "disabled": { "type": "boolean" },
    },
    "required": ["message", "scooterId"]
};
exports.dataScooterSchema = dataScooterSchema;
const dataTripSchema = {
    "id": "/MessageDataTrip",
    "type": "object",
    "properties": {
        "message": {
            "type": "string",
            "pattern": /^trip$/
        },
        "tripId": { "type": "number" },
        "distance": { "type": "number" },
        "route": {
            "type": "array",
            "items": {
                "type": "array",
                "items": {
                    "type": "number"
                }
            }
        },
        "routeAppend": {
            "type": "array",
            "items": {
                "type": "array",
                "items": {
                    "type": "number"
                }
            }
        },
        "parkedCharging": { "type": "boolean" }
    },
    "required": ["message", "tripId"]
};
exports.dataTripSchema = dataTripSchema;
const dataTripStartSchema = {
    "id": "/MessageDataTripStart",
    "type": "object",
    "properties": {
        "message": {
            "type": "string",
            "pattern": /^tripStart$/
        },
        "customerId": { "type": "number" },
        "scooterId": { "type": "number" }
    },
    "required": ["message", "customerId", "scooterId"]
};
exports.dataTripStartSchema = dataTripStartSchema;
const dataTripEndSchema = {
    "id": "/MessageDataTripEnd",
    "type": "object",
    "properties": {
        "message": {
            "type": "string",
            "pattern": /^tripEnd$/
        },
        "tripId": { "type": "number" }
    },
    "required": ["message", "tripId"]
};
exports.dataTripEndSchema = dataTripEndSchema;
const dataSubscribeSchema = {
    "id": "/MessageDataSubscribe",
    "type": "object",
    "properties": {
        "message": {
            "type": "string",
            "pattern": /^subscribe$/
        },
        "subscriptions": {
            "type": "array",
            "items": {
                "type": "string"
            }
        }
    },
    "required": ["message", "subscriptions"]
};
exports.dataSubscribeSchema = dataSubscribeSchema;
