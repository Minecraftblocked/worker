/**
 * Debug-only environment
 */
export const environment = {
  production: false,
  db: {
    host: 'localhost',
    port: 3306,
    database: 'blocked',
    user: 'root',
    password: '',
  },
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
};
