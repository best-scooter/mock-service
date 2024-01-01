import hardwareBridge from "../controller/hardwareBridge"
import Position from "./types/position"

export default {
    /**
     * When the customer updates it's position, the scooter will follow.
     * At the same time, battery and speed will be updated with new random values.
     * @param {number} scooterId
     * @param {array} position Expected to be [longitude, latitude] based on previous group descision
     */
    followCustomer: function (scooterId: number, position: Array<number>): void {
        const positionLatLong: Position = {
            x: position[1],
            y: position[0]
        }

        this.updatePosition(scooterId, positionLatLong)
        this.decreaseBattery(scooterId)
        this.updateSpeed(scooterId)
    },

    /**
     * Update the battery level. Can decrease between a random value of 0.01 and 0.05 (1-5%).
     * @param {number} scooterId 
     */
    decreaseBattery: function (scooterId: number): void {
        const currentBattery = hardwareBridge.getBatteryFor(scooterId)

        const min = 0.01
        const max = 0.05
        const batteryChange = this.getRandomNumber(min, max)

        const newBattery = currentBattery - batteryChange
        hardwareBridge.writeNewBattery(scooterId, newBattery)
    },

    /**
     * Simulates the battery being fully charged after a two minute timer has passed
     * @param {number} scooterId 
     */
    chargeBattery: function (scooterId: number): void {
        const twoMinutesInMilliSec = 120000

        setTimeout(() => {
            this.setBatteryFull(scooterId)
        }, twoMinutesInMilliSec)
    },

    setBatteryFull: function (scooterId: number): void {
        const battery = 1
        hardwareBridge.writeNewBattery(scooterId, battery)
    },

    /**
     * Updates the scooters position.
     * @param {number} scooterId
     * @param {array} gps Expected to be [longitude, latitude] based on previous group descision
     */
    updatePosition: function (scooterId: number, gps: Position): void {
        hardwareBridge.writeNewPosition(scooterId, gps)
    },

    /**
     * Maybe not actually needed?
     * Updates latitude and longitude between +/- 0.03 degrees.
     * @param {number} scooterId 
     */
    updatePositionRandom: function (scooterId: number): void {
        const currentPosition = hardwareBridge.getPositionFor(scooterId)
        const latitude = currentPosition.x
        const longitude = currentPosition.y

        const max = 0.03
        const latitudeChange = this.getRandomNumber(max)
        const longitudeChange = this.getRandomNumber(max)
        const forwards = this.getRandomNumber() < 0.5

        let newLatitude = 0
        let newLongitude = 0
        if (forwards) {
            newLatitude = latitude + latitudeChange
            newLongitude = longitude + longitudeChange
        } else {
            newLatitude = latitude - latitudeChange
            newLongitude = longitude - longitudeChange
        }

        const newPosition: Position = {
            x: newLatitude,
            y: newLongitude
        }

        hardwareBridge.writeNewPosition(scooterId, newPosition)

    },

    /**
     * Update to a new speed between 0-20 km/h.
     * @param {number} scooterId 
     */
    updateSpeed: function (scooterId: number): void {
        const max = 20
        const newSpeed = Math.floor(this.getRandomNumber(max))
        hardwareBridge.writeNewSpeed(scooterId, newSpeed)
    },

    /**
     * Set the current speed to 0.
     * @param {number} scooterId 
     */
    setSpeedZero: function (scooterId: number): void {
        const speed = 0
        hardwareBridge.writeNewSpeed(scooterId, speed)
    },

    /**
     * Check if the scooter's lamp is on or off.
     * @param {number} scooterId 
     * @returns {string} "On" or "off"
     */
    readLight: function (scooterId: number): string {
        const currentLight = hardwareBridge.getLightFor(scooterId)
        return currentLight
    },

    /**
     * Get a random number.
     * @param {number} min Default 0
     * @param {number} max Default 1
     * @returns {number} A random number betwween min and max
     */
    getRandomNumber: function (min: number = 0, max: number = 1): number {
        return Math.random() * (max - min) + min;
    }
}