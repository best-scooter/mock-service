"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminPayloadSchema = exports.scooterPayloadSchema = exports.customerPayloadSchema = void 0;
const customerPayloadSchema = {
    "id": "/ClientInfoCustomer",
    "type": "object",
    "properties": {
        "type": {
            "type": "string",
            "pattern": /^customer$/
        },
        "customerEmail": { "type": "string" }
    },
    "required": ["type", "customerEmail"]
};
exports.customerPayloadSchema = customerPayloadSchema;
const scooterPayloadSchema = {
    "id": "/ClientInfoScooter",
    "type": "object",
    "properties": {
        "type": {
            "type": "string",
            "pattern": /^scooter$/
        },
        "scooterId": { "type": "number" }
    },
    "required": ["type", "scooterId"]
};
exports.scooterPayloadSchema = scooterPayloadSchema;
const adminPayloadSchema = {
    "id": "/ClientInfoAdmin",
    "type": "object",
    "properties": {
        "type": {
            "type": "string",
            "pattern": /^admin$/
        },
        "adminUsername": { "type": "string" },
        "adminLevel": { "type": "string" }
    },
    "required": ["type", "adminUsername", "adminLevel"]
};
exports.adminPayloadSchema = adminPayloadSchema;
