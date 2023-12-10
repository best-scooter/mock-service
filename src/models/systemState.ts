import { validate } from "jsonschema";

import SystemState from "../classes/SystemState";
import { scooterStateSchema, customerStateSchema, tripStateSchema } from "../jsonschemas/stateData";
import EnvVars from "../constants/EnvVars";

// **** Variables **** //

let adminJwt: string;

// **** Helper functions **** //

async function _httpGetAll(endpoint: string, token: string) {
    return fetch(EnvVars.ApiHost + endpoint, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "X-Access-Token": token
        }
    }).then((response) => {
        return response.json();
    })
}

function _stateFetch(token: string) {
    _httpGetAll("scooter", token).then((scooterData: any) => {
        for (const scooter of scooterData.data) {
            if (
                validate(scooter, scooterStateSchema).valid &&
                scooter.connected
            ) {

                systemState.addClientData("scooters", scooter);
            }
        }
    });

    _httpGetAll("customer", token).then((customerData: any) => {
        for (const customer of customerData.data) {
            if (
                validate(customer, customerStateSchema).valid &&
                customer.connected
            ) {
                systemState.addClientData("customers", customer);
            }
        }
    });

    _httpGetAll("trip", token).then((tripData: any) => {
        for (const trip of tripData.data) {
            if (
                validate(trip, tripStateSchema).valid && 
                (
                    // if time ended is not yet set or if its set earlier than now
                    // interpret the trip as currently ongoing
                    trip.timeEnded === null ||
                    Date.parse(trip.timeEnded) > Date.now()
                )
            ) {
                systemState.addClientData("trips", trip);
            }
        }
    });
}

// **** Setup **** //

const systemState = new SystemState();

function stateInitialise() {
    fetch(EnvVars.ApiHost + "admin/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: EnvVars.AdminUsername,
            password: EnvVars.AdminPassword
        })
    }).then((response: Response) => {
        return response.json();
    }).then((result: any) => {
       _stateFetch(result.data.token);
       adminJwt = result.data.token;
    });
}

// **** Exports **** //

export { systemState, stateInitialise, adminJwt }
