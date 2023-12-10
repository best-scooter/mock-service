type MessageData = {
    message: "subscribe",
    subscriptions: Array<string>
} | {
    message: "customer",
    customerId: number,
    position: Array<number>
} | {
    message: "scooter",
    scooterId: number,
    position?: [number, number],
    battery?: number,
    status?: string,
    charging?: boolean
} | {
    message: "tripStart",
    customerId: number,
    scooterId: number
} | {
    message: "tripEnd",
    tripId: number
} | {
    message: "trip",
    tripId: number,
    distance?: number,
    route?: [number, number][],
    routeAppend?: [number, number][],
    parkedCharging?: boolean
}

export type { MessageData };
