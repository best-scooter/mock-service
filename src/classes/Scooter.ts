import { client, connection } from "websocket";
import jwt from 'jsonwebtoken';

import EnvVars from "../constants/EnvVars";
import Client from "./Client";
import HardwareHelper from "../hardwareMock/model/hardwareHelper";
import apiRequests from "../models/apiRequests";
import ScooterType from '../types/ScooterType';

// **** Variables **** //

// **** Helper functions **** //

// **** Classes **** //

class Scooter extends Client {
    scooterId: number;
    available: boolean = true;
    maxSpeed: number = 30 * EnvVars.SpeedMultiplier;
    battery: number = 0.5;
    charging: boolean = false;
    decomissioned: boolean = false;
    beingServiced: boolean = false;
    disabled: boolean = false; // TODO: Fortsätt

    constructor(connection: connection, token: string) {
        super(connection, token)

        const payload = jwt.verify(token, EnvVars.JwtSecret);

        if (typeof payload !== "object") {
            throw new Error("JWT payload expects type 'object'.");
        }

        this.scooterId = payload.scooterId;
        this.info = "Scooter " + payload.scooterId;

        // Kommentera bort för att lyckas starta
        const scooterData = apiRequests.getScooter(this.scooterId, this.token)
            .then(response => {
                this.available = (response.available as boolean)
                this.maxSpeed = (response.maxSpeed as number)
                this.battery = (response.battery as number)
                this.charging = (response.charging as boolean)
                this.decomissioned = (response.decomissioned as boolean)
                this.beingServiced = (response.beingServiced as boolean)
                this.disabled = (response.disabled as boolean)
            }).catch((error) => {
                throw error
            })

        // Ett litet exempel
        // hardwareBuilder.buildHardwareFile(this)
        // En scooter-klass startar bara om en scooter-app container ansluter till mock-service websocket-server?
    }

    set position(positionYX: [number, number]) {
        this._position = positionYX;

        // Kommentera bort för att lyckas starta
        const hardwareData = HardwareHelper.updatePosSpeedBatt(this.scooterId, positionYX, this.token)
            .then(response => {
                this.battery = (response.battery as number)
            })
    }
    
    get position() {
        return this._position;
    }

    // TODO: lägga till för statusar: klass, databas, ws. Glöm inte lägga till laddningsfunktion för laddning! kom ihåg sätta available = false
}

// **** Exports **** //

export default Scooter;