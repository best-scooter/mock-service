"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestVerification = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jet_logger_1 = __importDefault(require("jet-logger"));
const EnvVars_1 = __importDefault(require("../constants/EnvVars"));
function requestVerification(token) {
    try {
        jsonwebtoken_1.default.verify(token, EnvVars_1.default.JwtSecret);
    }
    catch (_a) {
        jet_logger_1.default.warn("Request token not verified.");
        return false;
    }
    return true;
}
exports.requestVerification = requestVerification;
