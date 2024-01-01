import { client, connection } from "websocket";
import jwt from 'jsonwebtoken';

import EnvVars from "../constants/EnvVars";
import Client from "./Client";
import HardwareHelper from "../hardwareMock/model/hardwareHelper";

// **** Variables **** //

// **** Helper functions **** //

// **** Classes **** //

class Scooter extends Client {
    scooterId: number;
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
        this.available = true;
        this.maxSpeed = 20;
    }

    set hardware(value: [number, number]) {
        super.position = value;

        HardwareHelper.followCustomer(this.scooterId, value)
    }
}

// **** Exports **** //

export default Scooter;