"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminJwt = exports.stateInitialise = exports.systemState = void 0;
const jsonschema_1 = require("jsonschema");
const SystemState_1 = __importDefault(require("../classes/SystemState"));
const stateData_1 = require("../jsonschemas/stateData");
const EnvVars_1 = __importDefault(require("../constants/EnvVars"));
let adminJwt;
function _httpGetAll(endpoint, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return fetch(EnvVars_1.default.ApiHost + endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-Access-Token": token
            }
        }).then((response) => {
            return response.json();
        });
    });
}
function _stateFetch(token) {
    _httpGetAll("scooter", token).then((scooterData) => {
        for (const scooter of scooterData.data) {
            if ((0, jsonschema_1.validate)(scooter, stateData_1.scooterStateSchema).valid &&
                scooter.connected) {
                systemState.addClientData("scooters", scooter);
            }
        }
    });
    _httpGetAll("customer", token).then((customerData) => {
        for (const customer of customerData.data) {
            if ((0, jsonschema_1.validate)(customer, stateData_1.customerStateSchema).valid &&
                customer.connected) {
                systemState.addClientData("customers", customer);
            }
        }
    });
    _httpGetAll("trip", token).then((tripData) => {
        for (const trip of tripData.data) {
            if ((0, jsonschema_1.validate)(trip, stateData_1.tripStateSchema).valid &&
                (trip.timeEnded === null ||
                    Date.parse(trip.timeEnded) > Date.now())) {
                systemState.addClientData("trips", trip);
            }
        }
    });
}
const systemState = new SystemState_1.default();
exports.systemState = systemState;
function stateInitialise() {
    fetch(EnvVars_1.default.ApiHost + "admin/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: EnvVars_1.default.AdminUsername,
            password: EnvVars_1.default.AdminPassword
        })
    }).then((response) => {
        return response.json();
    }).then((result) => {
        _stateFetch(result.data.token);
        exports.adminJwt = adminJwt = result.data.token;
    });
}
exports.stateInitialise = stateInitialise;
