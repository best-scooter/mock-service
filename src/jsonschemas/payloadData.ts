// For a payload from a customer token
const customerPayloadSchema = {
    "id": "/ClientInfoCustomer",
    "type": "object",
    "properties": {
        "type": {
            "type": "string",
            "pattern": /^customer$/
        },
        "customerEmail": {"type": "string"}
    },
    "required": ["type", "customerEmail"]
}

// For a payload from a scooter token
const scooterPayloadSchema = {
    "id": "/ClientInfoScooter",
    "type": "object",
    "properties": {
        "type": {
            "type": "string",
            "pattern": /^scooter$/
        },
        "scooterId": {"type": "number"}
    },
    "required": ["type", "scooterId"]
}

// For a payload from a customer token
const adminPayloadSchema = {
    "id": "/ClientInfoAdmin",
    "type": "object",
    "properties": {
        "type": {
            "type": "string",
            "pattern": /^admin$/
        },
        "adminUsername": {"type": "string"},
        "adminLevel": {"type": "string"}
    },
    "required": ["type", "adminUsername", "adminLevel"]
}

export {
    customerPayloadSchema,
    scooterPayloadSchema,
    adminPayloadSchema
};
