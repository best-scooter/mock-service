type CustomerState = {
    customerId: number,
    customerEmail: string,
    positionX: number,
    positionY: number
}

type ScooterState = {
    scooterId: number,
    positionX?: number,
    positionY?: number,
    battery?: number,
    charging?: boolean,
    available?: boolean,
    decomissioned?: boolean,
    beingServiced?: boolean,
    disabled?: boolean
}

type TripState = {
    scooterId?: number,
    customerId?: number,
    tripId?: number,
    timeStarted?: string,
    timeEnded?: string,
    distance?: number,
    route?: [number, number][]
}

export type { CustomerState, ScooterState, TripState }
