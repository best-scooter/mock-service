import './pre-start'; // Must be the first import

import logger from 'jet-logger';

import EnvVars from './constants/EnvVars';
import { httpServer } from './server';

// **** Variables **** //

const SERVER_START_MSG = ('WebSocket server started on port: ' + 
    EnvVars.Port.toString());

// **** Setup **** //

httpServer.listen(EnvVars.Port, () => logger.info(SERVER_START_MSG));

// **** Exports **** //
