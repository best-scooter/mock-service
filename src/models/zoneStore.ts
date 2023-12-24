import * as turf from '@turf/turf';

import type Zone from "../types/Zone"
import apiRequests from "./apiRequests";
import { NoZoneFoundError } from '../classes/Errors';

const zoneStore = {
    _zones: [] as Array<Zone>,

    get zones() {
        return this._zones as Array<Zone>;
    },

    getZone(zoneId: number): Zone {
        let foundZone: Zone|null = null;

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

    getZoneMaxSpeed(position: Array<number>) {
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

    getCityZone(position: Array<number>) {
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
    }
}

export default zoneStore;