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
};
