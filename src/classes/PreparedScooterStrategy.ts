import logger from "jet-logger";
import fs from 'fs';
import path from 'path';

import ScooterStrategy from "./ScooterStrategy";
import helpers from "../utils/helpers";
import EnvVars from "../constants/EnvVars";

class PreparedScooterStrategy extends ScooterStrategy {
    private async reinitiate(reason: string) {
        logger.info(`Reinitiating scooter ${this.scooter.scooterId} decision strategy with reason: ${reason}`);
        await helpers.wait(EnvVars.RefreshDelay);
    }

    protected async main() {
        while(true) {
            const jsonPath = path.join(__dirname, '../assets/preparedRoutes.json')
            const allPrepared = JSON.parse(fs.readFileSync(jsonPath).toString())
            const randomIndex = Math.floor(Math.random()*allPrepared.length)
            const prepared = allPrepared[randomIndex];
            const route = prepared.route;
            const targetPosition = prepared.target;
            this.scooter.position = prepared.start;

            await this.move(route, targetPosition);

            await this.reinitiate("Destination reached.")
        }
    }
}

export default PreparedScooterStrategy;