// @ts-ignore
import Openrouteservice from 'openrouteservice-js';
import * as turf from '@turf/turf';
import randomPointsOnPolygon from 'random-points-on-polygon';
import logger from 'jet-logger';

import EnvVars from '../constants/EnvVars';
import Zone from '../types/ZoneType';
import { NoRouteFoundError } from '../classes/Errors';

export default {
    async getRouteTo(startCoordinates: [number, number], targetCoordinates: [number, number]) {
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

            return route.map((item: [number, number]) => {
                return item.reverse();
            }) as Array<[number, number]>;
        } catch (err) {
            logger.info("An error occurred getting route from Openrouteservice. Error response code: " + err.status)
            logger.err(JSON.stringify(await err.response.json()))
            throw new NoRouteFoundError();
        }
    },

    wait(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    getDistance(positionA: [number, number], positionB: [number, number]) {
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

    getCenter(area: Array<[number, number]>) {
        const poly = turf.polygon([[...area, area[0]]])
        const point = turf.centroid(poly);

        return point.geometry.coordinates as [number, number];
    },

    getRandomPositions(zone: Zone, amount?: number) {
        const poly = turf.polygon([[...zone.area, zone.area[0]]]);
        const points = randomPointsOnPolygon(amount ?? 1, poly);
        const holder = [];

        for (const point of Object.values(points)) {
            holder.push(point.geometry.coordinates);
        }

        return holder as Array<[number, number]>;
    },

    getRandomDestination(origin: [number, number], distance: number) {
        const pt = turf.point(origin);
        const bearing = (Math.random() * 360) - 180;
        const dist = distance / 1000;
        const destinationPt = turf.destination(pt, dist, bearing);

        return destinationPt.geometry.coordinates as [number, number];
    }
}
