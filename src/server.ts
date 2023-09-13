if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

import * as Sentry from '@sentry/node';
import {ProfilingIntegration} from '@sentry/profiling-node';

import morgan from 'morgan';
import helmet from 'helmet';
import StatusCodes from 'http-status-codes';
import express, {NextFunction, Request, Response} from 'express';

import {json} from 'body-parser';

import cron from 'node-cron';

import 'express-async-errors';
import logger from 'jet-logger';

import httpContext from 'express-http-context';

import {CustomError} from './shared/errors';
import {ApolloServer} from '@apollo/server';
import {expressMiddleware} from '@apollo/server/express4';

import {buildSchema} from 'type-graphql';

import resolvers from './graphql';
import keepThingsUpdated from './cron/keepThingsUpdated';
import cors from 'cors';
import {env} from './config';
import {authorizeAndSetSupabaseUser} from '@shared/auth';
import {customAuthChecker} from '@shared/auth/graphql';
import {ApolloContext} from '@graphql/server/types';
import datastore from '@shared/datastore';
import {sentryPlugin} from '@util/sentry';
import {maybeSendReminders} from '@cron/reminders/maybeSendReminders';
import {loggingPlugin} from '@graphql/plugins/loggingPlugin';

const app = express();

Sentry.init({
  dsn:
    'https://8d484c4b5caa42fb1c88d9bff9f13fd5@o4505802352754688.ingest.sentry.io/4505802354196480',
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({
      tracing: true,
    }),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express({
      app,
    }),
    new ProfilingIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
});

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

/************************************************************************************
 *                              Set basic express settings
 ***********************************************************************************/

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Show routes called in console during development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Security
if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
}

// Error handling
app.use((err: Error | CustomError, _: Request, res: Response, __: NextFunction) => {
  logger.err(err, true);
  const status = err instanceof CustomError ? err.HttpStatus : StatusCodes.BAD_REQUEST;
  return res.status(status).json({
    error: err.message,
  });
});

app.use(cors());

app.use(httpContext.middleware);

app.use(async (req, res, next) => {
  const bearerToken = req.get('Authorization');
  if (bearerToken) {
    const token = bearerToken.split(' ').at(1);
    if (token) {
      await authorizeAndSetSupabaseUser(token);
    }
  }
  next();
});

// Run the 3 minute cron
if (process.env.FUNTIME_RUN_CRON === 'true') {
  logger.info(`Starting cron in ${env}`);

  // 3 mins to keep games updated
  cron.schedule('*/3 * * * *', async () => {
    await keepThingsUpdated();
  });

  // cron.schedule('0 * * * *', async () => {
  cron.schedule('*/30 * * * *', async () => {
    await maybeSendReminders();
  });
}

async function bootstrap() {
  const schema = await buildSchema({
    resolvers,
    dateScalarMode: 'isoDate',
    authChecker: customAuthChecker,
  });

  // TODO consider pulling the server into a different file for creation
  const server = new ApolloServer({
    schema,
    // introspection: env !== 'production',
    introspection: true,
    // Need to figure out how to clear the cache after mutations
    // cache: new KeyvAdapter(new Keyv(process.env.REDIS_URL)),
    plugins: [sentryPlugin, loggingPlugin],
  });

  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    json(),
    expressMiddleware(server, {
      context: async ({req: _req}): Promise<ApolloContext> => {
        const transaction = Sentry.startTransaction({
          op: 'gql',
          name: 'GraphQLTransaction', // this will be the default name, unless the gql query has a name
        });
        return {prisma: datastore, transaction};
      },
    })
  );
}

bootstrap().then(() => {
  // The error handler must be registered before any other error middleware and after all controllers
  app.use(Sentry.Handlers.errorHandler());
});

/************************************************************************************
 *                              Export Server
 ***********************************************************************************/

export default app;
