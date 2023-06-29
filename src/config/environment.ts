import * as production from './environments/production.environment';
import * as debug from './environments/debug.environment';

let env: Environment;

type Environment = {
  production: boolean;
  redis: {
    host: string;
    port: number;
    username: string;
    password: string;
  };
  sentry: {
    dsn: string;
  };
  worker: {
    secret: string;
  };
  openai: {
    key: string;
  };
};

if (process.env.ENVIRONMENT === 'production') {
  env = production.environment;
} else env = debug.environment;

export const environment = env;
