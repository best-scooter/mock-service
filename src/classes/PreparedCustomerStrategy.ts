import logger from "jet-logger";
import fs from 'fs';
import path from 'path';

import Customer from "./Customer";
import CustomerStrategy from "./CustomerStrategy";
import helpers from "../utils/helpers";
import EnvVars from "../constants/EnvVars";
import MoverStrategy from "./CustomerStrategy";
import { NoRouteFoundError, NoScooterFoundError, NoTripFoundError, TooShortRouteError } from "./Errors";

class PreparedCustomerStrategy extends CustomerStrategy {
    private async reinitiate(reason: string) {
        logger.info(`Reinitiating customer ${this.customer.customerId} decision strategy with reason: ${reason}`);
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
            this.customer.position = prepared.start;

            await this.move(EnvVars.WalkingSpeed, route, targetPosition);

            await this.reinitiate("Destination reached.")
        }
    }
}

export default PreparedCustomerStrategy;