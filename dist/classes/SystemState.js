"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jet_logger_1 = __importDefault(require("jet-logger"));
const jsonschema_1 = require("jsonschema");
const stateData_1 = require("../jsonschemas/stateData");
class SystemState {
    constructor() {
        this._scooters = [];
        this._customers = [];
        this._trips = [];
    }
    set scooters(dataArray) {
        this._scooters = dataArray;
    }
    set customers(dataArray) {
        this._customers = dataArray;
    }
    set trips(dataArray) {
        this._trips = dataArray;
    }
    getState(key) {
        switch (key) {
            case "scooters":
                return this._scooters;
            case "customers":
                return this._customers;
            case "trips":
                return this._trips;
        }
    }
    removeClientData(key, id) {
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
    addClientData(key, data) {
        const stateArray = this.getState(key);
        let schema;
        let idKey;
        let defaults;
        switch (key) {
            case "scooters":
                schema = stateData_1.scooterStateSchema;
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
                schema = stateData_1.customerStateSchema;
                idKey = "customerId";
                defaults = {};
                break;
            case "trips":
                schema = stateData_1.tripStateSchema;
                idKey = "tripId";
                defaults = {};
                break;
            default:
                throw new Error("Unrecongnised key.");
        }
        if (!(0, jsonschema_1.validate)(data, schema).valid) {
            console.log((0, jsonschema_1.validate)(data, schema));
            jet_logger_1.default.warn("Data from database does not validate.");
            return;
        }
        const stateEntryIndex = data[idKey];
        if ((0, jsonschema_1.validate)(stateArray[stateEntryIndex], schema, { required: true }).valid) {
            stateArray[stateEntryIndex] = Object.assign(Object.assign({}, stateArray[stateEntryIndex]), data);
        }
        else {
            stateArray[stateEntryIndex] = Object.assign(Object.assign({}, defaults), data);
        }
    }
}
exports.default = SystemState;
