// **** Schema for any kind of message **** //
const dataSchema = {
    "id": "/MessageData",
    "type": "object",
    "properties": {
        "message": {
            "type": "string",
            "pattern": /^(customer|scooter|trip|tripStart|tripEnd|subscribe)$/
        },
        "customerEmail": {"type": "string"},
        "customerId": {"type": "number"},
        "positionX": {"type": "number"},
        "positionY": {"type": "number"},
        "battery": {"type": "number"},
        "charging": {"type": "boolean"},
        "available": {"type": "boolean"},
        "decomissioned": {"type": "boolean"},
        "beingServiced": {"type": "boolean"},
        "disabled": {"type": "boolean"},
        "scooterId": {"type": "number"},
        "parkedCharging": {"type": "boolean"},
        "distance": {"type": "number"},
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

// **** Schema for 'customer' type message **** //
const dataCustomerSchema = {
    "id": "/MessageDataCustomer",
    "type": "object",
    "properties": {
        "message": {
            "type": "string",
            "pattern": /^customer$/
        },
        "customerId": {"type": "number"},
        "positionX": {"type": "number"},
        "positionY": {"type": "number"}
    },
    "required": ["message", "customerId", "positionX", "positionY"]
}

// **** Schema for 'scooter' type message **** //
const dataScooterSchema = {
    "id": "/MessageDataScooter",
    "type": "object",
    "properties": {
        "message": {
            "type": "string",
            "pattern": /^scooter$/
        },
        "scooterId": {"type": "number"},
        "positionX": {"type": "number"},
        "positionY": {"type": "number"},
        "battery": {"type": "number"},
        "charging": {"type": "boolean"},
        "available": {"type": "boolean"},
        "decomissioned": {"type": "boolean"},
        "beingServiced": {"type": "boolean"},
        "disabled": {"type": "boolean"},
    },
    "required": ["message", "scooterId"]
}

// **** Schema for 'trip' type message **** //
const dataTripSchema = {
    "id": "/MessageDataTrip",
    "type": "object",
    "properties": {
        "message": {
            "type": "string",
            "pattern": /^trip$/
        },
        "tripId": {"type": "number"},
        "distance": {"type": "number"},
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
}

// **** Schema for 'tripStart' type message **** //
const dataTripStartSchema = {
    "id": "/MessageDataTripStart",
    "type": "object",
    "properties": {
        "message": {
            "type": "string",
            "pattern": /^tripStart$/
        },
        "customerId": {"type": "number"},
        "scooterId": {"type": "number"}
    },
    "required": ["message", "customerId", "scooterId"]
}

// **** Schema for 'tripStart' type message **** //
const dataTripEndSchema = {
    "id": "/MessageDataTripEnd",
    "type": "object",
    "properties": {
        "message": {
            "type": "string",
            "pattern": /^tripEnd$/
        },
        "tripId": {"type": "number"}
    },
    "required": ["message", "tripId"]
}

// **** Schema for 'tripStart' type message **** //
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
}

export {
    dataSchema,
    dataCustomerSchema,
    dataScooterSchema,
    dataTripSchema,
    dataTripStartSchema,
    dataTripEndSchema,
    dataSubscribeSchema
}
