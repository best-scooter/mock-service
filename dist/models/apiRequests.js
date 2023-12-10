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
exports.postTrip = exports.getTrip = exports.getScooterPosition = exports.putTrip = exports.putCustomer = exports.putScooter = void 0;
const EnvVars_1 = __importDefault(require("../constants/EnvVars"));
const systemState_1 = require("./systemState");
function _httpPut(url, data, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Access-Token": token
            },
            body: JSON.stringify(data)
        });
    });
}
function _httpPost(url, data, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Access-Token": token
            },
            body: JSON.stringify(data)
        }).then((response) => {
            return response.json();
        }).then((result) => {
            return result;
        });
    });
}
function _httpGet(url) {
    return __awaiter(this, void 0, void 0, function* () {
        return fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-Access-Token": systemState_1.adminJwt
            }
        }).then((response) => {
            return response.json();
        }).then((result) => {
            return result;
        });
    });
}
function putScooter(scooterId, data, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield _httpPut(`${EnvVars_1.default.ApiHost}scooter/${scooterId}`, data, token);
    });
}
exports.putScooter = putScooter;
function putCustomer(customerId, data, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield _httpPut(`${EnvVars_1.default.ApiHost}customer/${customerId}`, data, token);
    });
}
exports.putCustomer = putCustomer;
function putTrip(tripId, data, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield _httpPut(`${EnvVars_1.default.ApiHost}trip/${tripId}`, data, token);
    });
}
exports.putTrip = putTrip;
function getScooterPosition(scooterId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield _httpGet(`${EnvVars_1.default.ApiHost}scooter/${scooterId}`);
        return [result.data.positionX, result.data.positionY];
    });
}
exports.getScooterPosition = getScooterPosition;
function getTrip(tripId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield _httpGet(`${EnvVars_1.default.ApiHost}trip/${tripId}`);
        return result.data;
    });
}
exports.getTrip = getTrip;
function postTrip(data, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield _httpPost(`${EnvVars_1.default.ApiHost}trip/${data.tripId}`, data, token);
        return result.data;
    });
}
exports.postTrip = postTrip;
