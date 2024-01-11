import './pre-start'; // Must be the first import

import logger from 'jet-logger';

import EnvVars from './constants/EnvVars';
import { httpServer } from './server';

// **** Variables **** //

const SERVER_START_MSG = ('WebSocket server started on port: ' + 
    EnvVars.Port.toString());

// **** Setup **** //

process.on('uncaughtException', (error) => {
    if (
        error instanceof TypeError &&
        error.cause &&
        // @ts-expect-error
        error.cause.name === "SocketError"
    ) {
        console.warn("Assumes this error to be non-critical and continues normal execution.")
        console.warn(error.name, error.message)
        // @ts-ignore
        console.warn("cause", error.cause.name, error.cause.message)

        return
    }

    console.error(error);
    process.exit(1);
})

httpServer.listen(EnvVars.Port, () => logger.info(SERVER_START_MSG));

// **** Exports **** //
