import { connection } from "websocket";
import jwt from 'jsonwebtoken';

import EnvVars from "../constants/EnvVars";

// **** Variables **** //

// **** Helper functions **** //

// **** Classes **** //

class Client {
    connection: connection;
    token: string;
    info: string;

    constructor(connection: connection, token: string) {
        this.token = token;
        this.connection = connection;
        this.info = "";
    }
}

// **** Exports **** //

export default Client;