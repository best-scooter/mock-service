import logger from "jet-logger";
import fs from 'fs';
import path from 'path';

import Customer from "./Customer";
import Strategy from "./Strategy";
import helpers from "../utils/helpers";
import EnvVars from "../constants/EnvVars";
import MoverStrategy from "./Strategy";
import { NoRouteFoundError, NoScooterFoundError, NoTripFoundError, TooShortRouteError } from "./Errors";

class PreparedCustomerStrategy extends Strategy {
    client: Customer;

    constructor(customer: Customer) {
        super(customer);
        this.client = customer;
    }

    initiate() {
        try {
            this.main();
        } catch (error) {
            if (error instanceof TooShortRouteError) {
                this.reinitiate("Generated route too short.")
            } else if (error instanceof NoRouteFoundError) {
                this.reinitiate("No route found to destination.")
            } else if (error instanceof NoScooterFoundError) {
                this.reinitiate("No scooter found.") 
            } else if (error instanceof NoTripFoundError) {
                this.reinitiate("No trip found.")
            } else {
                throw error;
            }
        }
    }

    private async reinitiate(reason: string) {
        logger.info(`Reinitiating customer ${this.client.customerId} decision strategy with reason: ${reason}`);
        await helpers.wait(EnvVars.RefreshDelay);
        try {
            this.initiate();
        } catch (error) {
            throw error;
        }
    }

    private async main() {
        const jsonPath = path.join(__dirname, '../assets/preparedRoutes.json')
        const allPrepared = JSON.parse(fs.readFileSync(jsonPath).toString())
        const randomIndex = Math.floor(Math.random()*allPrepared.length)
        const prepared = allPrepared[randomIndex];
        const route = prepared.route;
        const targetPosition = prepared.target;

        this.client.position = prepared.start;

        try {
            await this.move(EnvVars.WalkingSpeed, route, targetPosition);
            this.reinitiate("Destination reached.")
        } catch(error) {
            throw error;
        }
    }
}

export default PreparedCustomerStrategy;