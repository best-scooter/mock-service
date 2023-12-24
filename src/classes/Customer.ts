import { connection } from "websocket";
import jwt from 'jsonwebtoken';

import EnvVars from "../constants/EnvVars";
import Client from "./Client";
import Strategy from "./Strategy";

// **** Variables **** //

// **** Helper functions **** //

// **** Classes **** //

class Customer extends Client {
    customerId: number;
    customerEmail: string;
    strategy: Strategy|null;

    constructor(connection: connection, token: string) {
        super(connection, token)
        const payload = jwt.verify(token, EnvVars.JwtSecret);

        if (typeof payload !== "object") {
            throw new Error("JWT payload expects type 'object'.");
        }

        this.customerId = payload.customerId;
        this.customerEmail = payload.customerEmail;
        this.info = "Customer " + payload.customerEmail;
        this.strategy = null;
    }

    set position(value: Array<number>) {
        this._position = value;
        this.connection.send(JSON.stringify({
            message: "customer",
            customerId: this.customerId,
            positionY: value[0],
            positionX: value[1]
        }));
    }

    get position() {
        return this._position;
    }

    initiate(strategy: Strategy) {
        this.strategy = strategy;
        this.strategy.initiate();
    }
}

// **** Exports **** //

export default Customer;