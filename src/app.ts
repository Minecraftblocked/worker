/**
 * Required modules
 */
import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { handleError } from './app/middlewares/errorHandler.middleware';
import morganMiddleware from './app/middlewares/morgan.middleware';
import * as Sentry from '@sentry/node';
import { environment as config } from './config/environment';

// Routes
import statusRoutes from './app/routes/status.routes';
import crawlRoutes from './app/routes/crawl.routes';

/**
 * ===
 * Worker
 * ===
 */
dotenv.config();
const app = express();

/* Init Sentry SDK for production-only */
if (config.production) {
  Sentry.init({
    dsn: config.sentry.dsn,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
      ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
    ],
    tracesSampleRate: 1.0,
  });
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
  app.use(Sentry.Handlers.errorHandler());
}

/* Global middleware */
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morganMiddleware);

/* Routes */
app.use(statusRoutes);
app.use(crawlRoutes);

//! define after everything else
app.use(handleError);

export default app;
