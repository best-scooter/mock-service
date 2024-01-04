import TripType from "../types/TripType";
import Scooter from "./Scooter";
import Customer from "./Customer";
import apiRequests from "../models/apiRequests";

class Trip {
    scooter: Scooter;
    customer: Customer;
    id: number;
    customerId: number;
    scooterId: number;
    bestParkingZone: number | null;
    bestPickupZone: number;
    parkedCharging: boolean | null;
    timeStarted: string;
    timeEnded: string | null;
    _distance: number;
    _route: [number, number][];
    priceInitial: number;
    priceTime: number;
    priceDistance: number;

    constructor(customer: Customer, scooter: Scooter, tripData: TripType) {
        this.id = tripData.id;
        this.customerId = tripData.customerId;
        this.scooterId = tripData.scooterId;
        this.bestPickupZone = tripData.bestPickupZone;
        this.bestParkingZone = null;
        this.parkedCharging = null;
        this.timeStarted = tripData.timeStarted;
        this.timeEnded = null;
        this._distance = 0;
        this._route = [];
        this.priceInitial = tripData.priceInitial;
        this.priceTime = tripData.priceTime;
        this.priceDistance = tripData.priceDistance;

        this.scooter = scooter;
        this.customer = customer;

        scooter.available = false;

        this.wsSend({
            timeStarted: new Date().toISOString(),
            route: [this.customer.position],
            distance: 0
        });

        scooter.charging = false;
    }

    async end() {
        const now = new Date().toISOString();

        this.timeEnded = now;

        await apiRequests.putTrip(this.id, {
            route: this._route,
            endPosition: this.customer.position,
            timeEnded: now,
            // parkedCharging: bool
        }, this.customer.token)

        this.customer.connection.send(JSON.stringify({
            message: "tripEnd",
            tripId: this.id,
            customerId: this.customerId,
            scooterId: this.scooterId
        }));

        // if parked in charging zone
        // this.scooter.charging = true
    }

    get tripId() {
        return this.id;
    }

    set tripId(value: number) {
        this.id = value;
    }

    get route() {
        return this._route;
    }

    set route(value: Array<[number, number]>) {
        this._route = value;

        this.send({ route: value });
    }

    get distance() {
        return this._distance;
    }

    set distance(value: number) {
        this._distance = value;

        this.send({ distance: value });
    }

    routeAppend(value: Array<[number, number]>, noBroadcast?: boolean) {
        this._route = this.route.concat(value);

        this.send({ routeAppend: value });
    }

    async update(routeAppend: Array<[number, number]>, distance: number) {
        this._route = this.route.concat(routeAppend);
        this._distance = distance;

        await this.send({ routeAppend, distance });
    }

    private wsSend(data: object) {
        this.customer.connection.send(JSON.stringify({
            message: "trip",
            tripId: this.id,
            customerId: this.customerId,
            scooterId: this.scooterId,
            ...data
        }))
    }

    private async apiSend(data: object) {
        await apiRequests.putTrip(this.id, data, this.customer.token)
    }

    private send(data: object) {
        this.wsSend(data);
        // await this.apiSend(data);
    }
}

export default Trip;
