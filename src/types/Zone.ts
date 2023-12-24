type Zone = {
    id: number,
    zoneId: number,
    type: string,
    area: [number, number][],
    colour: string,
    name: string,
    description: string,
    parkingValue: number,
    maxSpeed: number
}

export default Zone;
