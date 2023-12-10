"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jsonschema_1 = require("jsonschema");
const EnvVars_1 = __importDefault(require("../constants/EnvVars"));
const payloadData_1 = require("../jsonschemas/payloadData");
class Client {
    constructor(connection, token) {
        const payload = jsonwebtoken_1.default.verify(token, EnvVars_1.default.JwtSecret);
        if (typeof payload !== "object") {
            throw new Error("JWT payload expects type 'object'.");
        }
        this.type = payload.type;
        if ((0, jsonschema_1.validate)(payload, payloadData_1.customerPayloadSchema).valid) {
            this.info = {
                customerEmail: payload.customerEmail,
                customerId: payload.id
            };
        }
        else if ((0, jsonschema_1.validate)(payload, payloadData_1.scooterPayloadSchema).valid) {
            this.info = {
                scooterId: payload.id
            };
        }
        else if ((0, jsonschema_1.validate)(payload, payloadData_1.adminPayloadSchema).valid) {
            this.info = {
                adminUsername: payload.adminUsername,
                adminLevel: payload.adminLevel
            };
        }
        else {
            throw new Error("JWT payload does not adhere to an expected schema.");
        }
        this.token = token;
        this.connection = connection;
    }
}
exports.default = Client;
