// @ts-ignore
import Openrouteservice from 'openrouteservice-js';
import * as turf from '@turf/turf';
import randomPointsOnPolygon from 'random-points-on-polygon';
import logger from 'jet-logger';

import EnvVars from '../constants/EnvVars';
import Zone from '../types/Zone';
import { NoRouteFoundError } from '../classes/Errors';

export default {
    async getRouteTo(startCoordinates: Array<number>, targetCoordinates: Array<Number>) {
        const orsDirections = new Openrouteservice.Directions({
            api_key: EnvVars.ORSApiKey
        });

        try {
            let response = await orsDirections.calculate({
                coordinates: [
                    [startCoordinates[1],startCoordinates[0]],
                    [targetCoordinates[1],targetCoordinates[0]]
                ],
                profile: 'cycling-regular',
                format: 'geojson',
                // radiuses: [10000]
            })

            const route = response.features[0].geometry.coordinates;

            return route.map((item: Array<number>) => {
                return item.reverse();
            });
        } catch (err) {
            logger.info("An error occurred getting route from Openrouteservice. Error response code: " + err.status)
            logger.err(JSON.stringify(await err.response.json()))
            throw new NoRouteFoundError();
        }
    },

    wait(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    getDistance(positionA: Array<number>, positionB: Array<number>) {
        const pointA = turf.point([
            positionA[0],
            positionA[1]
        ]);
        const pointB = turf.point([
            positionB[0],
            positionB[1]
        ]);
        const distance = turf.distance(pointA, pointB);

        return distance;
    },

    getCenter(area: Array<Array<number>>) {
        const poly = turf.polygon([[...area, area[0]]])
        const point = turf.centroid(poly);

        return point.geometry.coordinates;
    },

    getRandomPositions(zone: Zone, amount?: number) {
        const poly = turf.polygon([[...zone.area, zone.area[0]]]);
        const points = randomPointsOnPolygon(amount ?? 1, poly);
        const holder = [];

        for (const point of Object.values(points)) {
            holder.push(point.geometry.coordinates);
        }

        return holder as Array<Array<number>>;
    }
}
