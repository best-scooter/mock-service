import logger from "jet-logger";
import * as turf from "@turf/turf";

import Scooter from "./Scooter";
import Customer from "./Customer";
import CustomerStrategy from "./CustomerStrategy";
import helpers from "../utils/helpers";
import EnvVars from "../constants/EnvVars";
import apiRequests from "../models/apiRequests";
import zoneStore from "../models/zoneStore";
import { NoRouteFoundError, NoScooterFoundError, NoTripFoundError, TooShortRouteError } from "./Errors";

class SimpleCustomerStrategy extends CustomerStrategy {
    private async reinitiate(reason: string) {
        logger.info(`Reinitiating customer ${this.customer.customerId} decision strategy with reason: ${reason}`);
        await helpers.wait(EnvVars.RefreshDelay);
    }

    protected async main() {
        while (true) {
            const currentCity = zoneStore.getCityZone(this.customer.position);
            const positions = helpers.getRandomPositions(currentCity, 1)
            const targetPosition = positions[0];
            const route = [this.customer.position, targetPosition];

            await this.move(route, targetPosition);

            await this.reinitiate("Destination reached.")
        }
    }
}

export default SimpleCustomerStrategy;