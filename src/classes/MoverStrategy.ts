import logger from 'jet-logger';
import * as turf from '@turf/turf';

import Scooter from '../classes/Scooter'
import EnvVars from '../constants/EnvVars';
import Client from './Client';
import Customer from './Customer';
import apiRequests from '../models/apiRequests';
import helpers from '../utils/helpers';
import { TooShortRouteError } from './Errors'

class MoverStrategy {
    client: Client

    constructor(client: Client) {
        this.client = client;
    }

    protected move(
        speed: number,
        route: Array<Array<number>>,
        endPosition: Array<number>,
        scooter?: Scooter,
        tripId?: number
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

                this.client.position = pointFeature.geometry.coordinates;

                if (tripId && scooter) {
                    const distance = Math.round((totalDistance < lineLength && totalDistance) || lineLength);
                    scooter.position = this.client.position;
                    apiRequests.putTrip(
                        tripId,
                        {
                            routeAppend: [this.client.position],
                            distance
                        },
                        this.client.token
                    );
                    this.client.connection.send(JSON.stringify({
                        message: "trip",
                        tripId: tripId,
                        routeAppend: [this.client.position],
                        distance
                    }));
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

export default MoverStrategy;