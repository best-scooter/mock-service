"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRouter = void 0;
const jet_logger_1 = __importDefault(require("jet-logger"));
const jsonschema_1 = require("jsonschema");
const incomingMsgs_1 = __importDefault(require("./incomingMsgs"));
const messageData_1 = require("../jsonschemas/messageData");
function _messageParser(message, conn) {
    if (message.type === 'binary') {
        conn.sendUTF('Unable to parse binary message.');
        jet_logger_1.default.warn('Unable to parse binary message.');
        return null;
    }
    ;
    let data;
    try {
        data = JSON.parse(message.utf8Data);
    }
    catch (_a) {
        jet_logger_1.default.warn('Unable to parse message: ' + message.utf8Data);
        conn.sendUTF('Unable to parse message: ' + message.utf8Data);
    }
    if ((0, jsonschema_1.validate)(data, messageData_1.dataSchema)) {
        return data;
    }
    jet_logger_1.default.warn('Message of unknown structure: ' + JSON.stringify(data));
    conn.sendUTF('Message of unknown structure: ' + JSON.stringify(data));
    return null;
}
function messageRouter(client) {
    client.connection.on('message', (message) => {
        const data = _messageParser(message, client.connection);
        if (!data) {
            return;
        }
        switch (data.message) {
            case "customer":
                incomingMsgs_1.default.receiveCustomer(data, client);
                break;
            case "scooter":
                incomingMsgs_1.default.receiveScooter(data, client);
                break;
            case "tripStart":
                incomingMsgs_1.default.receiveTripStart(data, client);
                break;
            case "tripEnd":
                incomingMsgs_1.default.receiveTripEnd(data, client);
                break;
            case "trip":
                incomingMsgs_1.default.receiveTrip(data, client);
                break;
            case "subscribe":
                incomingMsgs_1.default.subscribe(data, client);
                break;
            default:
                client.connection.sendUTF("Unknown message.");
        }
    });
}
exports.messageRouter = messageRouter;
