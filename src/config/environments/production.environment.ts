import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Production-only environment.
 * Set random values if fail to find in .ENV.
 * Will resolve in an error anyway with the other values.
 */
export const environment = {
  production: true,
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 9999,
    username: process.env.REDIS_USER || 'root',
    password: process.env.REDIS_PASSWORD || '',
  },
  sentry: {
    dsn: process.env.SENTRY_DSN || '',
  },
  worker: {
    secret: process.env.SECRET || '',
  },
  openai: {
    key: process.env.OPENAI_KEY || '',
  },
  twitter: {
    apiKey: process.env.TWITTER_API_KEY || '',
    apiSecret: process.env.TWITTER_API_SECRET || '',
    bearerToken: process.env.TWITTER_BEARER_TOKEN || '',
    accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || '',
  },
};
