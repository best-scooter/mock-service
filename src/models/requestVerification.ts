import jwt from "jsonwebtoken";
import logger from "jet-logger"

import EnvVars from "../constants/EnvVars";

// **** Variables **** //

// **** Helper functions **** //

// **** Functions **** //

function requestVerification(token: string) {
    try {
        jwt.verify(token, EnvVars.JwtSecret);
    } catch {
        logger.warn("Request token not verified.")
        return false;
    }

    return true;
}

// **** Exports **** //

export {
    requestVerification
}
