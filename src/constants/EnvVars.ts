/**
 * Environments variables declared here.
 */

/* eslint-disable node/no-process-env */


export default {
  NodeEnv: (process.env.NODE_ENV ?? ""),
  Port: parseInt(process.env.PORT ?? ""),
  JwtSecret: (process.env.JWT_SECRET ?? ""),
  ApiHost: (process.env.API_HOST ?? ""),
  AdminUsername: (process.env.ADMIN_USERNAME ?? ""),
  AdminPassword: (process.env.ADMIN_PASSWORD ?? ""),
  NrOfScooters: parseInt(process.env.NR_OF_SCOOTERS ?? ""),
  NrOfCustomers: parseInt(process.env.NR_OF_CUSTOMERS ?? ""),
  NrOfSmartCustomers: parseInt(process.env.NR_OF_SMART_CUSTOMERS ?? ""),
  NrOfPreparedCustomers: parseInt(process.env.NR_OF_PREPARED_CUSTOMERS ?? ""),
  WsHost: (process.env.WS_HOST ?? ""),
  ORSApiKey: (process.env.ORS_API_KEY ?? ""),
  RefreshDelay: parseInt(process.env.REFRESH_DELAY ?? ""),
  WalkingSpeed: parseFloat(process.env.WALKING_SPEED ?? ""),
  SpeedMultiplier: parseFloat(process.env.SPEED_MULTIPLIER ?? "")
} as const;
