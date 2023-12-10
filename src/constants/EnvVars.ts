/**
 * Environments variables declared here.
 */

/* eslint-disable node/no-process-env */


export default {
  NodeEnv: (process.env.NODE_ENV ?? ''),
  Port: (process.env.PORT ?? "0"),
  JwtSecret: (process.env.JWT_SECRET ?? ""),
  ApiHost: (process.env.API_HOST ?? ""),
  AdminUsername: (process.env.ADMIN_USERNAME ?? ""),
  AdminPassword: (process.env.ADMIN_PASSWORD ?? ""),
  PriceInitial: (process.env.PRICE_INITIAL ?? 10),
  PriceTime: (process.env.PRICE_TIME ?? 10),
  PriceDistance: (process.env.PRICE_DISTANCE ?? 10)
} as const;
