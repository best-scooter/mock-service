import logger from "jet-logger";
// @ts-ignore
import nodeCleanup from 'node-cleanup';

import Scooter from "./Scooter";
import Customer from "./Customer";
import CustomerStrategy from "./CustomerStrategy";
import { NoRouteFoundError, NoScooterFoundError, NoTripFoundError, TooShortRouteError } from "./Errors";
import helpers from "../utils/helpers";
import { clientStore } from "../server";
import EnvVars from "../constants/EnvVars";
import apiRequests from "../models/apiRequests";
import zoneStore from "../models/zoneStore";
import Trip from "./Trip";

class SmartCustomerStrategy extends CustomerStrategy {
    private async reinitiate(reason: string) {
        logger.info(`Reinitiating customer ${this.customer.customerId} decision strategy with reason: ${reason}`);

        if (this.scooter) {
            this.scooter.available = true;
            this.scooter = null;
        }

        if (this.trip) {
            await this.trip.end();
            this.trip = null;
        }

        await helpers.wait(EnvVars.RefreshDelay);
    }

    protected async main() {
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

            const destination = helpers.getRandomDestination(this.customer.position, 200)
            if (!destination) {
                await this.reinitiate("Could not find random destination.")
                continue;
            }

            const goToDestinationSuccess = await this.goToDestination(destination);
            if (!goToDestinationSuccess) {
                await this.reinitiate("Could not go to destination");
                continue;
            }

            await this.reinitiate("Destination reached.")
        }
    }

    private async goToScooter(scooter: Scooter) {
        let route;

        try {
            route = await helpers.getRouteTo(this.customer.position, scooter.position);
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

        return true;
    }

    private getNearbyScooter(): Scooter|null {
        let closestDistance = Infinity;
        let nearestScooter: Scooter|null = null;

        for (const scooter of clientStore._scooters) {
            if (!scooter.available) { continue; }

            const distance = helpers.getDistance(this.customer.position, scooter.position);

            if (distance < closestDistance) {
                closestDistance = distance;
                nearestScooter = scooter;
            }
        }

        return nearestScooter
    }

    private async startTrip(scooter: Scooter) {
        const result = await apiRequests.postTrip(
            this.customer.customerId,
            scooter.scooterId,
            this.customer.position,
            this.customer.token
        );
        const trip = new Trip(this.customer, scooter, result.data);

        // nodeCleanup((exitCode: number, signal: string) => {
        //     if (signal) {
        //         trip.end().then(function () {
        //             // calling process.exit() won't inform parent process of signal
        //             process.kill(process.pid, signal);
        //         });
        //         nodeCleanup.uninstall(); // don't call cleanup handler again
        //         return false;
        //     }
        // });

        // process.on('SIGINT', () => {
        //     trip.end();
        // });

        return trip;
    }

    private async goToZone(scooter: Scooter): Promise<boolean> {
        const targetZone = await this.getRandomParkingZone();
        const target = helpers.getCenter(targetZone.area);
        const zoneSpeed = zoneStore.getZoneMaxSpeed(this.customer.position);
        const scooterSpeed = scooter.maxSpeed;
        // choose the lowest max speed
        const speed = (zoneSpeed < scooterSpeed && zoneSpeed) || scooterSpeed;
        let route: Array<[number, number]>;

        if (!this.scooter) {
            throw new NoScooterFoundError();
        }

        try {
            route = await helpers.getRouteTo(this.customer.position, target)
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

        await this.trip.end();
        this.trip = null;
        this.scooter.available = true;
        this.scooter = null;

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
            route = await helpers.getRouteTo(this.customer.position, destination)
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