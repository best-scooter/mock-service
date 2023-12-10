import { connection } from "websocket";
import jwt from 'jsonwebtoken';
import { validate } from "jsonschema";

import type { ClientInfo } from "../types/ClientInfo";

import EnvVars from "../constants/EnvVars";
import { scooterPayloadSchema, customerPayloadSchema, adminPayloadSchema } from "../jsonschemas/payloadData";

// **** Variables **** //

// **** Helper functions **** //

// **** Classes **** //

class Client {
    connection: connection;
    token: string;
    type: string;
    info: ClientInfo;

    constructor(connection: connection, token: string) {
        const payload = jwt.verify(token, EnvVars.JwtSecret);

        if (typeof payload !== "object") {
            throw new Error("JWT payload expects type 'object'.");
        }

        this.type = payload.type;

        if (validate(payload, customerPayloadSchema).valid) {
            this.info = {
                customerEmail: payload.customerEmail,
                customerId: payload.id
            };
        } else if (validate(payload, scooterPayloadSchema).valid) {
            this.info = {
                scooterId: payload.id
            };
        } else if (validate(payload, adminPayloadSchema).valid) {
            this.info = {
                adminUsername: payload.adminUsername,
                adminLevel: payload.adminLevel
            }
        } else {
            throw new Error("JWT payload does not adhere to an expected schema.")
        }

        this.token = token;
        this.connection = connection;
    }
}

// **** Exports **** //

export default Client;