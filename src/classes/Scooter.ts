import { client, connection } from "websocket";
import jwt from 'jsonwebtoken';

import EnvVars from "../constants/EnvVars";
import Client from "./Client";

// **** Variables **** //

// **** Helper functions **** //

// **** Classes **** //

class Scooter extends Client {
    scooterId: number;

    constructor(connection: connection, token: string) {
        super(connection, token)

        const payload = jwt.verify(token, EnvVars.JwtSecret);

        if (typeof payload !== "object") {
            throw new Error("JWT payload expects type 'object'.");
        }

        this.scooterId = payload.scooterId;
        this.info = "Scooter " + payload.scooterId;
    }
}

// **** Exports **** //

export default Scooter;