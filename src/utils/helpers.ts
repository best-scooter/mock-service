// @ts-ignore
import Openrouteservice from 'openrouteservice-js';
import * as turf from '@turf/turf';

import EnvVars from '../constants/EnvVars';

export default {
    async getRouteTo(startCoordinates: Array<number>, targetCoordinates: Array<Number>) {
        const orsDirections = new Openrouteservice.Directions({
            api_key: EnvVars.ORSApiKey
        });

        try {
            let response = await orsDirections.calculate({
                coordinates: [
                    startCoordinates,
                    targetCoordinates
                ],
                profile: 'cycling-regular',
                format: 'geojson',
                // radiuses: [10000]
            })

            const route = response.features[0].geometry.coordinates;

            return route;
        } catch (err) {
            console.log("An error occurred: " + err.status)
            console.error(await err.response.json())
            return null;
        }
    },

    wait(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    getDistance(positionA: Array<number>, positionB: Array<number>) {
        const pointA = turf.point([
            positionA[1],
            positionA[0]
        ]);
        const pointB = turf.point([
            positionB[1],
            positionB[0]
        ]);
        const distance = turf.distance(pointA, pointB);

        return distance;
    }
}
