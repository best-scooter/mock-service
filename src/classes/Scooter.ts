import { client, connection } from "websocket";
import jwt from 'jsonwebtoken';

import EnvVars from "../constants/EnvVars";
import Client from "./Client";
import ApiRequests from "../models/apiRequests";
import ScooterType from "../types/ScooterType";
import ScooterStrategy from "./ScooterStrategy";

// **** Variables **** //

// **** Helper functions **** //

// **** Classes **** //

class Scooter extends Client {
    scooterId: number;
    strategy: ScooterStrategy|null;
    _available: boolean = true;
    maxSpeed: number = 30 * EnvVars.SpeedMultiplier;;
    battery: number = 1;
    _charging: boolean = false;
    _decomissioned: boolean = false;
    _beingServiced: boolean = false;
    _disabled: boolean = false;
    _redLight: string = "off";
    currentSpeed: number = 0;

    constructor(connection: connection, token: string, position: [number, number]) {
        super(connection, token)

        const payload = jwt.verify(token, EnvVars.JwtSecret);

        if (typeof payload !== "object") {
            throw new Error("JWT payload expects type 'object'.");
        }

        this.scooterId = payload.scooterId;
        this.info = "Scooter " + payload.scooterId;
        this.strategy = null;
        this._position = position;

        ApiRequests.getScooter(this.scooterId, this.token)
            .then(response => {
                // this.available = true
                this.maxSpeed = (response.maxSpeed as number)
                this.battery = (response.battery as number)
                this._decomissioned = (response.decomissioned as boolean)
                this._beingServiced = (response.beingServiced as boolean)
                this._disabled = (response.disabled as boolean)
                this.updateAvailable()

                const scooterData = {
                    positionX: this.position[1],
                    positionY: this.position[0],
                    battery: this.battery,
                    charging: this.charging,
                    available: this.available,
                    decomissioned: this.decomissioned,
                    beingServiced: this.beingServiced,
                    disabled: this.disabled,
                    currentSpeed: this.currentSpeed
                }

                this.connection.send(JSON.stringify({
                    message: "scooter",
                    scooterId: this.scooterId,
                    ...scooterData
                }));

                ApiRequests.putScooter(this.scooterId, scooterData, this.token);
            }).catch((error) => {
                throw error
            })
    }

    updateAvailable() {
        let available = false;

        if (
            !this._beingServiced &&
            !this._charging &&
            !this._decomissioned &&
            !this._disabled
        ) {
            available = true;
        }

        this._available = available;
    }

    set position(positionYX: [number, number]) {
        this._position = positionYX;
        this.connection.send(JSON.stringify({
            message: "scooter",
            scooterId: this.scooterId,
            positionY: positionYX[0],
            positionX: positionYX[1]
        }))
    }

    get position() {
        return this._position;
    }

    set available(value: boolean) {
        if (this._available !== value) {
            this.connection.send(JSON.stringify({
                message: "scooter",
                scooterId: this.scooterId,
                available: value
            }))
        }

        this._available = value

        const data: ScooterType = {
            available: value
        }
        ApiRequests.putScooter(this.scooterId, data, this.token)
    }

    get available() {
        return this._available
    }

    set charging(value: boolean) {
        this._charging = value
        this._redLight = "off"

        this.updateAvailable()

        const data: ScooterType = {
            charging: value,
            available: this.available
        }

        ApiRequests.putScooter(this.scooterId, data, this.token)
        this.connection.send(JSON.stringify({
            message: "scooter",
            scooterId: this.scooterId,
            charging: value,
            available: this.available
        }))
    }

    get charging() {
        return this._charging;
    }

    set decomissioned(value: boolean) {
        this._decomissioned = value;
        this.updateAvailable();

        const data: ScooterType = {
            decomissioned: value,
            available: this.available
        }
        ApiRequests.putScooter(this.scooterId, data, this.token)

        this.connection.send(JSON.stringify({
            message: "scooter",
            scooterId: this.scooterId,
            decomissioned: this.decomissioned,
            available: this.available
        }))
    }

    get decomissioned() {
        return this._decomissioned;
    }

    set beingServiced(value: boolean) {
        this._beingServiced = value;
        this.updateAvailable();

        const data: ScooterType = {
            beingServiced: value,
            available: this.available
        };
        ApiRequests.putScooter(this.scooterId, data, this.token)

        this.connection.send(JSON.stringify({
            message: "scooter",
            scooterId: this.scooterId,
            beingServiced: this.beingServiced,
            available: this.available
        }))
    }

    get beingServiced() {
        return this._beingServiced
    }

    set disabled(value: boolean) {

        this._disabled = value;
        this.updateAvailable();

        const data: ScooterType = {
            disabled: value
        }
        ApiRequests.putScooter(this.scooterId, data, this.token)

        this.connection.send(JSON.stringify({
            message: "scooter",
            scooterId: this.scooterId,
            disabled: this.disabled,
            available: this.available
        }))
    }

    get disabled() {
        return this._disabled;
    }

    initiate(strategy: ScooterStrategy) {
        this.strategy = strategy;
        this.strategy.initiate();
    }
}

// **** Exports **** //

export default Scooter;