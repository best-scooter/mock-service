import hardwareBridge from "./hardwareBridge"
import Scooter from "../model/types/scooter"

export default {
    /**
     * Setting upp every scooters hardware based on scooter stored in the database.
     * @param {Array} scooters Expects an array of scooter objects with each scooters
     * batterylevel, lamp status, speed and start position.
     */
    buildHardwareFiles: function (scooters: Array<Scooter>): void {
        scooters.forEach((scooter) => {
            hardwareBridge.writeNewBattery(scooter.id, scooter.battery)
            hardwareBridge.writeNewLight(scooter.id, scooter.redLight)
            hardwareBridge.writeNewSpeed(scooter.id, scooter.speed)
            hardwareBridge.writeNewPosition(scooter.id, scooter.position)
        })
    }
}