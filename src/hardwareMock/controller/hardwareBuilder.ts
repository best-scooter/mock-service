import hardwareBridge from "./hardwareBridge"
import Scooter from "../model/types/scooter"

export default {
    /**
     * Setting upp every scooters hardware based on scooter stored in the database.
     * @param {Object} scooters Expects a scooter object with batterylevel, lamp status, speed and start position.
     */
    buildHardwareFile: function (scooter: Scooter): void {
        hardwareBridge.writeNewBattery(scooter.id, scooter.battery)
        hardwareBridge.writeNewLight(scooter.id, scooter.redLight)
        hardwareBridge.writeNewSpeed(scooter.id, scooter.speed)
        hardwareBridge.writeNewPosition(scooter.id, scooter.position)
    }
}