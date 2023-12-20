import hardwareBridge from "../controller/hardwareBridge"
import Position from "./types/position"

export default {
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
     * Simulates the battery being fully charged after a ten minute timer has passed
     * @param {number} scooterId 
     */
    chargeBattery: function (scooterId: number): void {
        const tenMinutesInMilliSec = 600000

        setTimeout(() => {
            this.setBatteryFull(scooterId)
        }, tenMinutesInMilliSec)
    },

    setBatteryFull: function (scooterId: number): void {
        const battery = 1
        hardwareBridge.writeNewBattery(scooterId, battery)
    },

    /**
     * Updates latitude and longitude between +/- 0.03 degrees.
     * @param {number} scooterId 
     */
    updatePosition: function (scooterId: number): void {
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