/**
 * Debug-only environment
 */
export const environment = {
  production: false,
  redis: {
    host: 'localhost',
    port: 6379,
    username: 'root',
    password: '',
  },
  sentry: {
    dsn: '',
  },
  worker: {
    secret: 'password',
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
