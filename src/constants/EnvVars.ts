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
  NrOfCustomers: parseInt(process.env.NR_OF_CUSTOMERS ?? ""),
  WsHost: (process.env.WS_HOST ?? "")
} as const;
