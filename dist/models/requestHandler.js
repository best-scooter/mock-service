"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestHandler = void 0;
const jet_logger_1 = __importDefault(require("jet-logger"));
const requestVerification_1 = require("./requestVerification");
const messageRouter_1 = require("./messageRouter");
const server_1 = require("../server");
const Client_1 = __importDefault(require("../classes/Client"));
const systemState_1 = require("./systemState");
const outgoingMsgs_1 = require("./outgoingMsgs");
function _onAllMessages(message) {
    if (message.type === 'utf8') {
        jet_logger_1.default.info('Received Message: ' + message.utf8Data);
    }
    else if (message.type === 'binary') {
        jet_logger_1.default.info('Received Binary Message of ' + message.binaryData.length + ' bytes');
    }
}
function _onClose() {
    const scooterId = this.client.info.scooterId;
    const customerId = this.client.info.customerId;
    if (this.client.type === "scooter" && typeof scooterId === "number") {
        systemState_1.systemState.removeClientData("scooters", scooterId);
        (0, outgoingMsgs_1.sendScooter)({
            message: "scooter",
            scooterId,
            remove: true
        });
    }
    else if (this.client.type === "customer" && typeof customerId === "number") {
        systemState_1.systemState.removeClientData("customers", customerId);
        (0, outgoingMsgs_1.sendCustomer)({
            message: "customer",
            customerId,
            remove: true
        });
    }
    server_1.clientStore.remove(this.client);
    jet_logger_1.default.info('Peer ' + this.client.connection.remoteAddress + ' disconnected.');
}
function requestHandler(request) {
    const token = Object.values(request.protocolFullCaseMap)[0];
    if (!(0, requestVerification_1.requestVerification)(token)) {
        request.reject();
        jet_logger_1.default.info('Connection from origin ' + request.origin + ' rejected.');
        return;
    }
    const conn = request.accept(null, request.origin);
    const client = new Client_1.default(conn, token);
    server_1.clientStore.add(client);
    jet_logger_1.default.info('Connection ' + conn.remoteAddress + ' accepted.');
    conn.on('close', _onClose.bind({ client }));
    (0, messageRouter_1.messageRouter)(client);
}
exports.requestHandler = requestHandler;
