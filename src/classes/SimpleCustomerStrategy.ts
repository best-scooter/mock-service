import logger from "jet-logger";
import * as turf from "@turf/turf";

import Scooter from "./Scooter";
import Customer from "./Customer";
import Strategy from "./Strategy";
import helpers from "../utils/helpers";
import EnvVars from "../constants/EnvVars";
import apiRequests from "../models/apiRequests";
import zoneStore from "../models/zoneStore";
import MoverStrategy from "./MoverStrategy";
import { NoRouteFoundError, NoScooterFoundError, NoTripFoundError, TooShortRouteError } from "./Errors";

class SimpleCustomerStrategy extends MoverStrategy implements Strategy {
    client: Customer;

    constructor(customer: Customer) {
        super(customer);
        this.client = customer;
    }

    async initiate() {
        await this.main();
    }

    private async reinitiate(reason: string) {
        logger.info(`Reinitiating customer ${this.client.customerId} decision strategy with reason: ${reason}`);
        await helpers.wait(EnvVars.RefreshDelay);
        this.initiate();
    }

    private async main() {
        const currentCity = zoneStore.getCityZone(this.client.position);
        const positions = helpers.getRandomPositions(currentCity)
        const targetPosition = positions[0];
        const route = [this.client.position, targetPosition];

        await this.move(EnvVars.WalkingSpeed, route, targetPosition);

        this.reinitiate("Destination reached.")
    }
}

export default SimpleCustomerStrategy;