import { connection } from "websocket";
import jwt from 'jsonwebtoken';
import logger from "jet-logger";
// import turf from 'turf';
// import length from '@turf/length';
import * as turf from '@turf/turf'

import EnvVars from "../constants/EnvVars";
import Client from "./Client";
import Scooter from "./Scooter";
import { clientStore } from "../server";
import apiRequests from "../models/apiRequests";
import helpers from "../utils/helpers";
import { NoScooterFoundError, NoRouteFoundError } from "./Errors";

// **** Variables **** //

// **** Helper functions **** //

// **** Classes **** //

class Customer extends Client {
    customerId: number;
    customerEmail: string;
    position: Array<number>;

    constructor(connection: connection, token: string) {
        super(connection, token)
        const payload = jwt.verify(token, EnvVars.JwtSecret);

        if (typeof payload !== "object") {
            throw new Error("JWT payload expects type 'object'.");
        }

        this.customerId = payload.customerId;
        this.customerEmail = payload.customerEmail;
        this.info = "Customer " + payload.customerEmail;
        this.position = [0, 0];
    }

    _getNearbyScooter(): Scooter|null {
        let closestDistance = Infinity;
        let nearestScooter: Scooter|null = null;

        for (const scooter of clientStore._scooters) {
            const distance = helpers.getDistance(this.position, scooter.position);

            if (distance < closestDistance) {
                closestDistance = distance;
                nearestScooter = scooter;
            }
        }

        return nearestScooter
    }

    async _reinitiate(reason: string) {
        logger.info("Reinitiating customer decision strategy with reason: " + reason);
        await helpers.wait(EnvVars.RefreshDelay);
        this.initiate();
    }

    _move(speed: number, route: Array<Array<number>>, endPosition: Array<number>) {
        const refreshInSeconds = EnvVars.RefreshDelay / 1000
        const distancePerRefresh = speed * refreshInSeconds;
        const line = turf.lineString(route);
        const lineLength = turf.lineDistance(line, 'meters');
        let totalDistance = 0;

        return new Promise(async (resolve, reject) => {
            while (totalDistance < lineLength) {
                totalDistance += distancePerRefresh;

                const pointFeature = turf.along(
                    line,
                    totalDistance / 1000
                );

                this.position = pointFeature.geometry.coordinates;

                console.log("ny position", this.position);
                console.log(totalDistance);

                this.connection.send(JSON.stringify({
                    message: "customer",
                    customerId: this.customerId,
                    positionX: this.position[0],
                    positionY: this.position[1]
                }));

                await helpers.wait(EnvVars.RefreshDelay);
            }

            this.position = endPosition;

            resolve(endPosition);
        });
    }

    async initiate() {
        try {
            await this.goToScooter();
        } catch(error) {
            if (error instanceof NoScooterFoundError) {
                return await this._reinitiate("No nearby scooter found.");
            } else if (error instanceof NoRouteFoundError) {
                return await this._reinitiate("No route found.");
            } else {
                throw error;
            }
        }

        // gå mot närmaste cykel

        // om en cykel är inom 5 meter => hyr cykeln

        // om resa pågår => åk med cykel mot...
            // uppdatera sin position gentemot ws-server
            // uppdatera trip route
            // uppdatera innevarande scooters position
    }

    async goToScooter() {
        const nearbyScooter = this._getNearbyScooter();

        if (!nearbyScooter) {
            throw new NoScooterFoundError();
        }

        if (nearbyScooter.position === this.position) {
            console.log("i reached the scooter wohoo")
            return;
        }

        const route = await helpers.getRouteTo(this.position, nearbyScooter.position);

        if (!route) {
            throw new NoRouteFoundError;
        }

        await this._move(EnvVars.WalkingSpeed, route, nearbyScooter.position);

        this.goToScooter();
    }
}

// **** Exports **** //

export default Customer;