import logger from "jet-logger";

import ScooterStrategy from "./ScooterStrategy";
import helpers from "../utils/helpers";
import EnvVars from "../constants/EnvVars";
import zoneStore from "../models/zoneStore";

class SimpleScooterStrategy extends ScooterStrategy {
    private async reinitiate(reason: string) {
        logger.info(`Reinitiating scooter ${this.scooter.scooterId} decision strategy with reason: ${reason}`);
        await helpers.wait(EnvVars.RefreshDelay);
    }

    protected async main() {
        while (true) {
            const currentCity = zoneStore.getCityZone(this.scooter.position);
            const positions = helpers.getRandomPositions(currentCity, 1)
            const targetPosition = positions[0];
            const route = [this.scooter.position, targetPosition];

            await this.move(route, targetPosition);

            await this.reinitiate("Destination reached.")
        }
    }
}

export default SimpleScooterStrategy;