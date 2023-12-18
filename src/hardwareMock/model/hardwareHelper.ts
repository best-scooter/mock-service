import hardwareBridge from "../controller/hardwareBridge"


export default {
    /**
     * Update the battery level. Can decrease between a random value of 0.01 and 0.05 (1-5%).
     * @param {number} scooterId 
     */
    updateBattery: function (scooterId: number): void {
        const currentBattery = hardwareBridge.getBatteryFor(scooterId)

        const min = 0.01
        const max = 0.05
        const batteryChange = this.getRandomNumber(min, max)

        const newBattery = currentBattery - batteryChange
        hardwareBridge.writeNewBattery(scooterId, newBattery)
    },

    /**
     * Updates latitude and longitude between +/- 0.03 degrees.
     * @param {number} scooterId 
     */
    updatePosition: function (scooterId: number): void {
        const currentPosition = hardwareBridge.getPositionFor(scooterId)
        const latitude = currentPosition[0]
        const longitude = currentPosition[1]

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

        const newPosition = []
        newPosition.push(newLatitude)
        newPosition.push(newLongitude)

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
     * Check if the scooter's lamp is on or off
     * @param {number} scooterId 
     * @returns {string} "On" or "off"
     */
    readLight: function (scooterId: number): string {
        const currentLight = hardwareBridge.getLightFor(scooterId)
        return currentLight
    },

    /**
     * Get a random number
     * @param {number} min Default 0
     * @param {number} max Default 1
     * @returns {number} A random number betwween min and max
     */
    getRandomNumber: function (min: number = 0, max: number = 1): number {
        return Math.random() * (max - min) + min;
    }
}