"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./pre-start");
const jet_logger_1 = __importDefault(require("jet-logger"));
const EnvVars_1 = __importDefault(require("./constants/EnvVars"));
const server_1 = require("./server");
const SERVER_START_MSG = ('WebSocket server started on port: ' +
    EnvVars_1.default.Port.toString());
server_1.httpServer.listen(EnvVars_1.default.Port, () => jet_logger_1.default.info(SERVER_START_MSG));
