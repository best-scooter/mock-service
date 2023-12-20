import { connection } from "websocket";
import jwt from 'jsonwebtoken';
// @ts-ignore
import Openrouteservice from 'openrouteservice-js';
import { getDistance } from 'geolib';
import logger from "jet-logger";

import EnvVars from "../constants/EnvVars";
import Client from "./Client";
import Scooter from "./Scooter";
import { clientStore } from "../server";
import { GeolibInputCoordinates } from "geolib/es/types";

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

    async _findRouteTo(targetCoordinates: Array<Number>) {
        const orsDirections = new Openrouteservice.Directions({
            api_key: EnvVars.ORSApiKey
        });

        try {
            let response = await orsDirections.calculate({
              coordinates: [this.position, targetCoordinates],
              profile: 'cycling-regular',
              format: 'geojson'
            })
            // Add your own result handling here
            console.log("response: ", response)
            console.log(response.features[0].geometry.coordinates)
      
          } catch (err) {
            console.log("An error occurred: " + err.status)
            console.error(await err.response)
          }
    }

    _getNearbyScooter(): Scooter|null {
        let closestDistance = Infinity;
        let nearestScooter: Scooter|null = null;

        for (const scooter of clientStore._scooters) {
            const customerPosition = {latitude: this.position[0], longitude: this.position[1]};
            const scooterPosition = {latitude: scooter.position[0], longitude: scooter.position[1]} as GeolibInputCoordinates;
            const distance = getDistance(customerPosition, scooterPosition);

            if (distance < closestDistance) {
                closestDistance = distance;
                nearestScooter = scooter;
            }
        }

        return nearestScooter
    }

    _timeout(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async _reinitiate(reason: string) {
        logger.info("Reinitiating customer decision strategy with reason: " + reason)
        await this._timeout(20000);
        this.initiate();
    }

    initiate() {
        const nearbyScooter = this._getNearbyScooter();

        if (!nearbyScooter) {
            return this._reinitiate("No nearby scooter found.");
        }

        this._findRouteTo(nearbyScooter.position)
        // gå mot närmaste cykel

        // om en cykel är inom 5 meter => hyr cykeln

        // om resa pågår => åk med cykel mot...
            // uppdatera sin position gentemot ws-server
            // uppdatera trip route
            // uppdatera innevarande scooters position
    }
}

// **** Exports **** //

export default Customer;