import logger from 'jet-logger';
import * as turf from '@turf/turf';

import Scooter from './Scooter'
import EnvVars from '../constants/EnvVars';
import Client from './Client';
import Customer from './Customer';
import Trip from './Trip';
import helpers from '../utils/helpers';
import zoneStore from '../models/zoneStore';

abstract class ScooterStrategy {
    scooter: Scooter;

    constructor(scooter: Scooter) {
        this.scooter = scooter;
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

            const zoneSpeed = zoneStore.getZoneMaxSpeed(this.scooter.position);
            const scooterSpeed = this.scooter.maxSpeed;
            // choose the lowest max speed
            const speed = (zoneSpeed < scooterSpeed && zoneSpeed) || scooterSpeed;

            const refreshInSeconds = EnvVars.RefreshDelay / 1000;
            const distancePerRefresh = speed * refreshInSeconds * EnvVars.SpeedMultiplier;
            const line = turf.lineString(route);
            const lineLength = turf.lineDistance(line) * 1000;
            let totalDistance = 0;

            // logger.info(`Scooter ${this.scooter.scooterId} starts a new journey with total length: ${Math.round(lineLength)}m.`)

            while (totalDistance < lineLength) {
                totalDistance += distancePerRefresh;
                const pointFeature = turf.along(
                    line,
                    totalDistance / 1000
                );

                this.scooter.position = pointFeature.geometry.coordinates as [number, number];

                // logger.info(`Customer ${id} has travelled ${totalDistance}m.`)

                if (totalDistance < lineLength) {
                    await helpers.wait(EnvVars.RefreshDelay);
                }
            }

            this.scooter.position = endPosition;

            return resolve(endPosition);
        });
    }
}

export default ScooterStrategy;