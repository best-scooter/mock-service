import Batteries from "../model/types/batteries"
import GPSES from "../model/types/gpses"
import Position from "../model/types/position"
import RedLights from "../model/types/redLights"
import Speedometers from "../model/types/speedometers"
import fs from 'fs'
// const fs = require('fs')
// const writeFileFlag = { encoding: "utf8", flag: "w", mode: 0o666 }
const writeFileFlag = { flag: "w", mode: 0o666 }

let basePath = process.env.HARDWARE_PATH

let batteries: Batteries = {}
let gpses: GPSES = {}
let redlights: RedLights = {}
let speedometers: Speedometers = {}

export default {
    /**
     * Get the current battery level for a specific scooter
     * @param {number} scooterId 
     * @returns {number} The batterylevel between 0-1 (0-100%)
     */
    getBatteryFor: function (scooterId: number): number {
        const currentBattery = batteries[scooterId]
        return currentBattery
    },

    /**
     * Update a scooters battery level. Write it the scooter's hardware-file.
     * @param {number} scooterId 
     * @param {number }newBattery 
     */
    writeNewBattery: function (scooterId: number, newBattery: number): void {
        batteries[scooterId] = newBattery
        fs.writeFileSync(basePath + "battery", JSON.stringify(batteries), writeFileFlag)
    },

    /**
     * Get the current position for a specific scooter
     * @param {number} scooterId 
     * @returns {array} [latitude, longitude]
     */
    getPositionFor: function (scooterId: number): Position {
        const currentPosition = gpses[scooterId]
        return currentPosition
    },

    /**
     * Update a scooter's position. Write it the scooter's hardware-file.
     * @param {number} scooterId
     * @param {array} newPosition [latitude, longitude]
     */
    writeNewPosition: function (scooterId: number, newPosition: Position): void {
        gpses[scooterId] = newPosition
        fs.writeFileSync(basePath + "gps", JSON.stringify(gpses), writeFileFlag)
    },

    /**
     * Update a scooter's position. Write it the scooter's hardware-file.
     * @param {number} scooterId
     * @param {number} newSpeed
     */
    writeNewSpeed: function (scooterId: number, newSpeed: number): void {
        speedometers[scooterId] = newSpeed
        fs.writeFileSync(basePath + "speedometer", JSON.stringify(speedometers), writeFileFlag)
    },

    /**
     * Get the lamp status for a specific scooter.
     * @param {number} scooterId
     * @returns {string} "On" or "off"
     */
    getLightFor: function (scooterId: number): string {
        const currentLight = redlights[scooterId]
        return currentLight
    },

    /**
     * Update a scooter's lamp status. Write it the scooter's hardware-file.
     * @param {number} scooterId
     * @param {string} newLight
     */
    writeNewLight: function (scooterId: number, newLight: string): void {
        redlights[scooterId] = newLight
        fs.writeFileSync(basePath + "redLight", JSON.stringify(redlights), writeFileFlag)
    }
}