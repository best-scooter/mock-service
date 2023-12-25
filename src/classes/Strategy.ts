import logger from 'jet-logger';
import * as turf from '@turf/turf';

import Scooter from './Scooter'
import EnvVars from '../constants/EnvVars';
import Client from './Client';
import Customer from './Customer';
import Trip from './Trip';
import apiRequests from '../models/apiRequests';
import helpers from '../utils/helpers';
import { TooShortRouteError } from './Errors'

abstract class Strategy {
    client: Client
    trip: Trip|null;
    scooter: Scooter|null;

    constructor(client: Client) {
        this.client = client;
        this.trip = null;
        this.scooter = null;
    }

    initiate() {
        // pass
    }

    protected move(
        speed: number,
        route: Array<[number, number]>,
        endPosition: [number, number]
    ) {
        if (route.length < 2) {
            return endPosition;
        }

        const refreshInSeconds = EnvVars.RefreshDelay / 1000;
        const distancePerRefresh = speed * refreshInSeconds * EnvVars.SpeedMultiplier;
        const line = turf.lineString(route);
        const lineLength = turf.lineDistance(line) * 1000;
        let totalDistance = 0;
        let id = "Unknown client";

        if (this.client instanceof Customer) {
            id = "Customer " + this.client.customerId;
        } else if (this.client instanceof Scooter) {
            id = "Scooter " + this.client.scooterId;
        }

        logger.info(`${id} starts a new journey with total length: ${Math.round(lineLength)}m.`)

        return new Promise(async (resolve, reject) => {
            while (totalDistance < lineLength) {
                totalDistance += distancePerRefresh;

                const pointFeature = turf.along(
                    line,
                    totalDistance / 1000
                );

                // logger.info(`${id} has travelled ${totalDistance}m.`)

                this.client.position = pointFeature.geometry.coordinates as [number, number];

                if (this.trip) {
                    const distance = Math.round((totalDistance < lineLength && totalDistance) || lineLength);
                    this.trip.update([this.client.position], distance)
                }
                
                if (this.scooter) {
                    this.scooter.position = this.client.position;
                }

                if (totalDistance < lineLength) {
                    await helpers.wait(EnvVars.RefreshDelay);
                }
            }

            this.client.position = endPosition;

            resolve(endPosition);
        });
    }
}

export default Strategy;