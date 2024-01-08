import { client, connection } from "websocket";
import jwt from 'jsonwebtoken';

import EnvVars from "../constants/EnvVars";
import Client from "./Client";
import HardwareHelper from "../hardwareMock/model/hardwareHelper";
import ApiRequests from "../models/apiRequests";
import HardwareBuilder from "../hardwareMock/controller/hardwareBuilder";
import ScooterHardware from "../hardwareMock/model/types/scooter";
import Position from "../hardwareMock/model/types/position";
import ScooterType from "@src/types/ScooterType";
import hardwareHelper from "../hardwareMock/model/hardwareHelper";

// **** Variables **** //

// **** Helper functions **** //

// **** Classes **** //

class Scooter extends Client {
    scooterId: number;
    _available: boolean = true;
    maxSpeed: number = 30 * EnvVars.SpeedMultiplier;;
    battery: number = 1;
    _charging: boolean = false;
    _decomissioned: boolean = false;
    _beingServiced: boolean = false;
    _disabled: boolean = false;
    _redLight: string = "off";
    currentSpeed: number = 0;

    constructor(connection: connection, token: string) {
        super(connection, token)

        const payload = jwt.verify(token, EnvVars.JwtSecret);

        if (typeof payload !== "object") {
            throw new Error("JWT payload expects type 'object'.");
        }

        this.scooterId = payload.scooterId;
        this.info = "Scooter " + payload.scooterId;

        const scooterData = ApiRequests.getScooter(this.scooterId, this.token)
            .then(response => {
                this._available = (response.available as boolean)
                this.maxSpeed = (response.maxSpeed as number)
                this.battery = (response.battery as number)
                this._charging = (response.charging as boolean)
                this._decomissioned = (response.decomissioned as boolean)
                this._beingServiced = (response.beingServiced as boolean)
                this._disabled = (response.disabled as boolean)
            }).catch((error) => {
                throw error
            })

        const positionGps: Position = {
            x: this.position[1],
            y: this.position[0]
        }

        const hardware: ScooterHardware = {
            id: this.scooterId,
            battery: this.battery,
            redLight: this._redLight,
            speed: this.currentSpeed,
            position: positionGps
        }

        HardwareBuilder.buildHardwareFile(hardware)
    }

    set position(positionYX: [number, number]) {
        this._position = positionYX;

        // Kommentera bort för att lyckas starta
        const hardwareData = HardwareHelper.updatePosSpeedBatt(this.scooterId, positionYX, this.token)
            .then(response => {
                this.battery = (response.battery as number)
                this.currentSpeed = (response.speed as number)
            })
    }

    get position() {
        return this._position;
    }

    set available(value: boolean) {
        this._available = value

        const data: ScooterType = {
            available: value
        }
        ApiRequests.putScooter(this.scooterId, data, this.token)

        this.connection.send(JSON.stringify({
            message: "scooter",
            scooterId: this.scooterId,
            available: value
        }))
    }

    set charging(value: boolean) {
        if (value == true) {
            this._charging = value
            this._available = false
            this._redLight = "on"

            const data: ScooterType = {
                charging: value,
                available: false
            }

            HardwareHelper.chargeBattery(this, data, this._redLight)

        } else if (value == false) {
            this._charging = value
            this._available = true
            this._redLight = "off"

            const data: ScooterType = {
                charging: value,
                available: true
            }
            ApiRequests.putScooter(this.scooterId, data, this.token)
            hardwareHelper.updateLight(this.scooterId, this._redLight)
        }

        this.connection.send(JSON.stringify({
            message: "scooter",
            scooterId: this.scooterId,
            charging: value,
            available: this._available
        }))
    }

    set decomissioned(value: boolean) {
        if (value == true) {
            this._decomissioned = value
            this._available = false
        } else if (value == false) {
            this._decomissioned = value
            this._available = true
        }

        const data: ScooterType = {
            decomissioned: value,
            available: this._available
        }
        ApiRequests.putScooter(this.scooterId, data, this.token)

        this.connection.send(JSON.stringify({
            message: "scooter",
            scooterId: this.scooterId,
            decomissioned: value,
            available: this._available
        }))
    }

    set beingServiced(value: boolean) {
        if (value == true) {
            this._beingServiced = value
            this._available = false
        } else if (value == false) {
            this._beingServiced = value
            this._available = true
        }

        const data: ScooterType = {
            beingServiced: value,
            available: this._available
        }
        ApiRequests.putScooter(this.scooterId, data, this.token)

        this.connection.send(JSON.stringify({
            message: "scooter",
            scooterId: this.scooterId,
            beingServiced: value,
            available: this._available
        }))
    }

    set disabled(value: boolean) {
        if (value == true) {
            this._disabled = value
            this._available = false
        } else if (value == false) {
            this._disabled = value
            this._available = true
        }

        const data: ScooterType = {
            disabled: value
        }
        ApiRequests.putScooter(this.scooterId, data, this.token)

        this.connection.send(JSON.stringify({
            message: "scooter",
            scooterId: this.scooterId,
            disabled: value
        }))
    }
}

// **** Exports **** //

export default Scooter;