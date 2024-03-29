type ScooterType = {
    id?: number;
    createdAt?: string;
    updatedAt?: string;
    positionX?: number;
    positionY?: number;
    battery?: number;
    maxSpeed?: number;
    charging?: boolean;
    available?: boolean;
    decomissioned?: boolean;
    beingServiced?: boolean;
    disabled?: boolean;
    connected?: boolean;
    password?: string;
    speed?: number
}

export default ScooterType; 