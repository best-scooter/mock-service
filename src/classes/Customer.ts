import { connection } from "websocket";
import jwt from 'jsonwebtoken';

import EnvVars from "../constants/EnvVars";
import Client from "./Client";

// **** Variables **** //

// **** Helper functions **** //

// **** Classes **** //

class Customer extends Client {
    customerId: number;
    customerEmail: string;

    constructor(connection: connection, token: string) {
        super(connection, token)
        const payload = jwt.verify(token, EnvVars.JwtSecret);

        if (typeof payload !== "object") {
            throw new Error("JWT payload expects type 'object'.");
        }

        this.customerId = payload.customerId;
        this.customerEmail = payload.customerEmail;
        this.info = "Customer " + payload.customerEmail;
    }
}

// **** Exports **** //

export default Customer;