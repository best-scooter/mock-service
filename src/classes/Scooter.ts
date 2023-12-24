import { client, connection } from "websocket";
import jwt from 'jsonwebtoken';

import EnvVars from "../constants/EnvVars";
import Client from "./Client";

// **** Variables **** //

// **** Helper functions **** //

// **** Classes **** //

class Scooter extends Client {
    scooterId: number;
    _position: Array<number>;
    available: boolean;
    maxSpeed: number;

    constructor(connection: connection, token: string) {
        super(connection, token)

        const payload = jwt.verify(token, EnvVars.JwtSecret);

        if (typeof payload !== "object") {
            throw new Error("JWT payload expects type 'object'.");
        }

        this.scooterId = payload.scooterId;
        this.info = "Scooter " + payload.scooterId;
        this._position = [0,0];
        this.available = true;
        this.maxSpeed = 20;
    }
}

// **** Exports **** //

export default Scooter;