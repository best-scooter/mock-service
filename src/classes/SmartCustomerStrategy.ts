import logger from "jet-logger";
import * as turf from "@turf/turf";

import Scooter from "./Scooter";
import Customer from "./Customer";
import Strategy from "./Strategy";
import { NoRouteFoundError, NoScooterFoundError, NoTripFoundError, TooShortRouteError } from "./Errors";
import helpers from "../utils/helpers";
import { clientStore } from "../server";
import EnvVars from "../constants/EnvVars";
import apiRequests from "../models/apiRequests";
import zoneStore from "../models/zoneStore";
import type Trip from "../types/Trip";
import MoverStrategy from "./MoverStrategy";

class SmartCustomerStrategy extends MoverStrategy implements Strategy {
    client: Customer;
    trip: Trip|null;

    constructor(customer: Customer) {
        super(customer);
        this.client = customer;
        this.trip = null;
    }

    initiate() {
        this.main();
    }

    private async reinitiate(reason: string) {
        logger.info(`Reinitiating customer ${this.client.customerId} decision strategy with reason: ${reason}`);
        await helpers.wait(EnvVars.RefreshDelay);
        // this.initiate();
    }

    private async main() {
        while (true) {
            const scooter = this.getNearbyScooter();
            if (!scooter) {
                await this.reinitiate("No nearby scooter found.")
                continue;
            }

            const result = await this.goToScooter(scooter);
            if (!result) {
                await this.reinitiate("Could not go to scooter.")
                continue;
            }

            this.trip = await this.startTrip(scooter);
            if (!this.trip) {
                await this.reinitiate("Could not start trip.")
                continue;
            }

            await this.goToZone(scooter);

            this.reinitiate("Destination reached.")
        }
        // try {
        //     const scooter = await this.goToScooter();

        //     this.trip = await this.startTrip(scooter);

        //     await this.goToZone(scooter);
        // } catch(error) {
        //     throw error;
        // }
    }

    private async goToScooter(scooter: Scooter) {
        // const nearbyScooter = this.getNearbyScooter();

        // if (!nearbyScooter) {
        //     throw new NoScooterFoundError();
        // }

        // while (scooter.position !== this.client.position) {
        let route;

        try {
            route = await helpers.getRouteTo(this.client.position, scooter.position);
        } catch (error) {
            if (
                error instanceof NoRouteFoundError ||
                error instanceof TooShortRouteError
            ) {
                return false;
            } else {
                throw error;
            }
        }

        if (!route) { return false; }

        await this.move(EnvVars.WalkingSpeed, route, scooter.position);
        // }

        return true;

        // if (nearbyScooter.position === this.client.position) {
        //     return nearbyScooter;
        // }

        // try {
        //     const route = await helpers.getRouteTo(this.client.position, nearbyScooter.position);

        //     await this.move(EnvVars.WalkingSpeed, route, nearbyScooter.position);

        //     return await this.goToScooter();
        // } catch(error) {
        //     console.log("inside smart goToScooter")
        //     throw error;
        // }
    }

    private getNearbyScooter(): Scooter|null {
        let closestDistance = Infinity;
        let nearestScooter: Scooter|null = null;

        for (const scooter of clientStore._scooters) {
            if (!scooter.available) { continue; }

            const distance = helpers.getDistance(this.client.position, scooter.position);

            if (distance < closestDistance) {
                closestDistance = distance;
                nearestScooter = scooter;
            }
        }

        return nearestScooter
    }

    private async startTrip(scooter: Scooter) {
        const result = await apiRequests.postTrip(
            this.client.customerId,
            scooter.scooterId,
            this.client.position,
            this.client.token
        );
        const trip = result.data;

        scooter.available = false;
        this.client.connection.send(JSON.stringify({
            message: "trip",
            scooterId: scooter.scooterId,
            customerId: this.client.customerId,
            tripId: trip.tripId,
            route: [this.client.position],
            distance: 0
        }));

        return trip;
    }

    private async goToZone(scooter: Scooter): Promise<number> {
        const targetZone = await this.getRandomParkingZone();
        const target = helpers.getCenter(targetZone.area);
        const zoneSpeed = zoneStore.getZoneMaxSpeed(this.client.position);
        const scooterSpeed = scooter.maxSpeed;
        // choose the lowest max speed
        const speed = (zoneSpeed < scooterSpeed && zoneSpeed) || scooterSpeed;
        let route: Array<Array<number>>;

        if (!this.trip) {
            throw new NoTripFoundError();
        }

        try {
            route = await helpers.getRouteTo(this.client.position, target)

            await this.move(speed, route, target, scooter, this.trip?.id);

            apiRequests.putTrip(this.trip.tripId, {
                    timeEnded: new Date().toISOString(),
                    endPosition: this.client.position
            }, this.client.token)

            this.client.connection.send(JSON.stringify({
                message: "tripEnd",
                tripId: this.trip.tripId
            }))

            return targetZone.zoneId;
        } catch(error) {
            throw error;
        }
    }

    private async getRandomParkingZone() {
        const zones = zoneStore.zones;
        const parkingZones = []
        
        for (const zone of zones) {
            if (zone.type.toLowerCase() === "parking") {
                parkingZones.push(zone);
            }
        }

        const randomIndex = Math.floor(Math.random()*parkingZones.length)
        const parkingZone = parkingZones[randomIndex];

        return parkingZone;
    }
}

export default SmartCustomerStrategy;