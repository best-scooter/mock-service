import logger from 'jet-logger';
import * as turf from '@turf/turf';

import Scooter from './Scooter'
import EnvVars from '../constants/EnvVars';
import Client from './Client';
import Customer from './Customer';
import Trip from './Trip';
import helpers from '../utils/helpers';
import zoneStore from '../models/zoneStore';

abstract class CustomerStrategy {
    customer: Customer
    trip: Trip|null;
    scooter: Scooter|null;

    constructor(customer: Customer) {
        this.customer = customer;
        this.trip = null;
        this.scooter = null;
    }

    initiate() {
        this.main();
    }

    protected async main() {
        //pass
    }

    protected move(
        route: Array<[number, number]>,
        endPosition: [number, number]
    ) {
        return new Promise(async (resolve, reject) => {
            if (route.length < 2) {
                return resolve(endPosition);
            }

            let speed: number = this.customer.walkingSpeed;
            if (this.scooter) {
                const zoneSpeed = zoneStore.getZoneMaxSpeed(this.customer.position);
                const scooterSpeed = this.scooter.maxSpeed;
                // choose the lowest max speed
                speed = (zoneSpeed < scooterSpeed && zoneSpeed) || scooterSpeed;
            }

            const refreshInSeconds = EnvVars.RefreshDelay / 1000;
            const distancePerRefresh = speed * refreshInSeconds * EnvVars.SpeedMultiplier;
            const line = turf.lineString(route);
            const lineLength = turf.lineDistance(line) * 1000;
            let totalDistance = 0;
            let id = this.customer.customerId;

            // logger.info(`Customer ${id} starts a new journey with total length: ${Math.round(lineLength)}m.`)

            while (totalDistance < lineLength) {
                totalDistance += distancePerRefresh;
                const pointFeature = turf.along(
                    line,
                    totalDistance / 1000
                );

                this.customer.position = pointFeature.geometry.coordinates as [number, number];

                if (this.trip) {
                    const distance = Math.round((totalDistance < lineLength && totalDistance) || lineLength);
                    await this.trip.update([this.customer.position], distance)
                }
                
                if (this.scooter) {
                    this.scooter.position = this.customer.position;
                }

                // logger.info(`Customer ${id} has travelled ${totalDistance}m.`)

                if (totalDistance < lineLength) {
                    await helpers.wait(EnvVars.RefreshDelay);
                }
            }

            this.customer.position = endPosition;

            return resolve(endPosition);
        });
    }
}

export default CustomerStrategy;