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
import Trip from "./Trip";

class SmartCustomerStrategy extends Strategy {
    client: Customer;

    constructor(customer: Customer) {
        super(customer);
        this.client = customer;
        this.trip = null;
        this.scooter = null;
    }

    initiate() {
        this.main();
    }

    private async reinitiate(reason: string) {
        logger.info(`Reinitiating customer ${this.client.customerId} decision strategy with reason: ${reason}`);

        if (this.scooter) {
            this.scooter.available = true;
            this.scooter = null;
        }

        if (this.trip) {
            this.trip.destroy();
            this.trip = null;
        }

        await helpers.wait(EnvVars.RefreshDelay);
        // this.initiate();
    }

    private async main() {
        while (true) {
            this.scooter = this.getNearbyScooter();
            if (!this.scooter) {
                await this.reinitiate("No nearby scooter found.")
                continue;
            }

            const goToScooterSuccess = await this.goToScooter(this.scooter);
            if (!goToScooterSuccess) {
                await this.reinitiate("Could not go to scooter.")
                continue;
            }

            const goToZoneSuccess = await this.goToZone(this.scooter);
            if (!goToZoneSuccess) {
                await this.reinitiate("Could not go to parking zone.")
                continue;
            }

            const destination = helpers.getRandomDestination(this.client.position, 200)
            if (!destination) {
                await this.reinitiate("Could not find random destination.")
                continue;
            }

            const goToDestinationSuccess = await this.goToDestination(destination);
            if (!goToDestinationSuccess) {
                await this.reinitiate("Could not go to destination");
                continue;
            }

            this.reinitiate("Destination reached.")
        }
    }

    private async goToScooter(scooter: Scooter) {
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
        const trip = new Trip(this.client, scooter, result.data);

        return trip;
    }

    private async goToZone(scooter: Scooter): Promise<boolean> {
        const targetZone = await this.getRandomParkingZone();
        const target = helpers.getCenter(targetZone.area);
        const zoneSpeed = zoneStore.getZoneMaxSpeed(this.client.position);
        const scooterSpeed = scooter.maxSpeed;
        // choose the lowest max speed
        const speed = (zoneSpeed < scooterSpeed && zoneSpeed) || scooterSpeed;
        let route: Array<[number, number]>;

        if (!this.scooter) {
            throw new NoScooterFoundError();
        }

        try {
            route = await helpers.getRouteTo(this.client.position, target)
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

        this.trip = await this.startTrip(this.scooter);

        await this.move(speed, route, target);

        apiRequests.putTrip(this.trip.tripId, {
                timeEnded: new Date().toISOString(),
                endPosition: this.client.position
        }, this.client.token)

        this.client.connection.send(JSON.stringify({
            message: "tripEnd",
            tripId: this.trip.tripId
        }))

        this.trip = null;

        return true;
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

    private async goToDestination(destination: [number, number]) {
        let route: Array<[number, number]>;

        try {
            route = await helpers.getRouteTo(this.client.position, destination)
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

        await this.move(EnvVars.WalkingSpeed, route, destination);

        return true;
    }
}

export default SmartCustomerStrategy;