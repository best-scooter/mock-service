
import logger from "jet-logger";
import { validate } from "jsonschema";

import { customerStateSchema, scooterStateSchema, tripStateSchema } from "../jsonschemas/stateData";
import { CustomerState, ScooterState, TripState } from "../types/ClientStates"

// **** Class **** //


type StateListKeys = "scooters" | "customers" | "trips";

class SystemState {
    private _scooters: Array<ScooterState>;
    private _customers: Array<CustomerState>;
    private _trips: Array<TripState>;

    constructor() {
        this._scooters = [];
        this._customers = [];
        this._trips = [];
    }

    set scooters(dataArray: Array<ScooterState>) {
        this._scooters = dataArray;
    }
    
    set customers(dataArray: Array<CustomerState>) {
        this._customers = dataArray;
    }
    
    set trips(dataArray: Array<TripState>) {
        this._trips = dataArray;
    }

    getState(key: StateListKeys) {
        switch (key) {
            case "scooters":
                return this._scooters;
            case "customers":
                return this._customers;
            case "trips":
                return this._trips;
        }
    }

    removeClientData(key: StateListKeys, id: number) {
        switch (key) {
            case "scooters":
                delete this._scooters[id];
                break;
            case "customers":
                delete this._customers[id];
                break;
            case "trips":
                delete this._trips[id];
                break;
        }
    }

    addClientData(key: StateListKeys, data: any) {
        const stateArray = this.getState(key);
        let schema: object;
        let idKey: string;
        let defaults: object;

        switch (key) {
            case "scooters":
                schema = scooterStateSchema;
                idKey = "scooterId";
                defaults = {
                    available: true,
                    battery: 0.5,
                    charging: false,
                    decomissioned: false,
                    beingServiced: false,
                    disabled: false,
                };
                break;
            case "customers":
                schema = customerStateSchema;
                idKey = "customerId";
                defaults = {};
                break;
            case "trips":
                schema = tripStateSchema;
                idKey = "tripId";
                defaults = {};
                break;
            default:
                throw new Error("Unrecongnised key.")
        }

        if (!validate(data, schema).valid) { 
            console.log(validate(data, schema));
            logger.warn("Data from database does not validate.");
            return;
        }

        const stateEntryIndex = data[idKey];

        if (validate(
                stateArray[stateEntryIndex],
                schema,
                { required: true }
            ).valid
        ) {
            stateArray[stateEntryIndex] = {
                ...stateArray[stateEntryIndex],
                ...data
            }
        } else {
            stateArray[stateEntryIndex] = {
                ...defaults,
                ...data
            };
        }
    }
}

// **** Exports **** //

export default SystemState;