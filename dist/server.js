"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientStore = exports.wsServer = exports.httpServer = void 0;
const websocket_1 = __importDefault(require("websocket"));
const http_1 = __importDefault(require("http"));
const jet_logger_1 = __importDefault(require("jet-logger"));
const ClientStore_1 = __importDefault(require("./classes/ClientStore"));
const requestHandler_1 = require("./models/requestHandler");
const EnvVars_1 = __importDefault(require("./constants/EnvVars"));
const misc_1 = require("./constants/misc");
const systemState_1 = require("./models/systemState");
const httpServer = http_1.default.createServer(function (request, response) {
    jet_logger_1.default.info((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
exports.httpServer = httpServer;
const wsServer = new websocket_1.default.server({
    httpServer: httpServer,
    autoAcceptConnections: false
});
exports.wsServer = wsServer;
const clientStore = new ClientStore_1.default();
exports.clientStore = clientStore;
wsServer.on('request', requestHandler_1.requestHandler);
(0, systemState_1.stateInitialise)();
if (EnvVars_1.default.NodeEnv === misc_1.NodeEnvs.Dev.valueOf()) {
    setInterval(() => {
        jet_logger_1.default.info("Subscribers: " + clientStore.all.length +
            "\tscooter: " + clientStore.subscribed.scooter.length +
            "\tscooterLimited: " + clientStore.subscribed.scooterLimited.length +
            "\tcustomer: " + clientStore.subscribed.customer.length +
            "\ttrip:" + clientStore.subscribed.trip.length);
        const scooterCount = systemState_1.systemState.getState("scooters").slice(1).length;
        const customerCount = systemState_1.systemState.getState("customers").slice(1).length;
        const tripCount = systemState_1.systemState.getState("trips").slice(1).length;
        jet_logger_1.default.info("Scooters: " + scooterCount +
            "\tCustomers:" + customerCount +
            "\t\tTrips:" + tripCount);
    }, 2000);
}
