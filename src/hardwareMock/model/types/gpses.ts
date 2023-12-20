import position from "./position";

type GPSES = {
    [scooterId: number]: position;
    // [scooterId: number]: [x: number, y: number]
}

export default GPSES