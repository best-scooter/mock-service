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
    _position: Array<number>

    constructor(connection: connection, token: string) {
        this.token = token;
        this.connection = connection;
        this.info = "";
        this._position = [0,0];
    }

    get position() {
        return this._position;
    }

    set position(value: Array<number>) {
        this._position = value;
    }
}

// **** Exports **** //

export default Client;