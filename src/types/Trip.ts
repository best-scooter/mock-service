type Trip = { 
    id: number,
    tripId: number,
    customerId: number,
    scooterId: number,
    bestParkingZone: number,
    bestPickupZone: number,
    parkedCharging: boolean,
    timeStarted: string,
    timeEnded: string,
    distance: number,
    route: [number, number][],
    priceInitial: number,
    priceTime: number,
    priceDistance: number
}

export default Trip;
