import * as turf from '@turf/turf';

import type Zone from "../types/ZoneType"
import apiRequests from "./apiRequests";
import { NoZoneFoundError } from '../classes/Errors';

const zoneStore = {
    _zones: [] as Array<Zone>,

    get zones() {
        return this._zones as Array<Zone>;
    },

    getZone(zoneId: number): Zone {
        let foundZone: Zone | null = null;

        for (const zone of this.zones) {
            if (zone.id === zoneId) {
                foundZone = zone;
            }
        }

        if (foundZone === null) {
            throw new NoZoneFoundError();
        }

        return foundZone;
    },

    async populate() {
        const result = await apiRequests.getZones();

        if (Array.isArray(result)) {
            this._zones = result;
        }
    },

    getZoneMaxSpeed(position: [number, number]) {
        let maxSpeed = Infinity;
        const pt = turf.point(position);

        for (const zone of this.zones) {
            const poly = turf.polygon([[...zone.area, zone.area[0]]])
            if (zone.maxSpeed < maxSpeed && turf.inside(pt, poly)) {
                maxSpeed = zone.maxSpeed;
            }
        }

        return maxSpeed;
    },

    getCityZone(position: [number, number]) {
        const pt = turf.point(position);

        for (const zone of this.zones) {
            const poly = turf.polygon([[...zone.area, zone.area[0]]])

            if (
                zone.type.toLowerCase() === "city" &&
                turf.inside(pt, poly)
            ) {
                return zone;
            }
        }

        throw new NoZoneFoundError();
    },

    getCommercialZone(position: [number, number]) {
        const pt = turf.point(position);

        for (const zone of this.zones) {
            const poly = turf.polygon([[...zone.area, zone.area[0]]])

            if (
                zone.type.toLowerCase() === "commercial" &&
                turf.inside(pt, poly)
            ) {
                return zone;
            }
        }

        throw new NoZoneFoundError();
    },

    isInParkingZone(position: [number, number]) {
        const pt = turf.point(position);
        let charging = false;

        for (const zone of this._zones) {
            const poly = turf.polygon([[...zone.area, zone.area[0]]])

            if (
                zone.type.toLowerCase() === "parking" &&
                turf.inside(pt, poly)
            ) {
                charging = true;
                // TODO: post parking?
            }
        }

        return charging;
    }
}

export default zoneStore;