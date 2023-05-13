if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
import morgan from 'morgan';
import helmet from 'helmet';
import StatusCodes from 'http-status-codes';
import express, {NextFunction, Request, Response} from 'express';

import cron from 'node-cron';

import 'express-async-errors';
import logger from 'jet-logger';

import httpContext from 'express-http-context';

import {CustomError} from './shared/errors';
import {ApolloServer} from 'apollo-server-express';

import {buildSchema} from 'type-graphql';

import resolvers from './graphql';
import datastore from '@shared/datastore';
import {ApolloPrismaContext} from './graphql/server/types';
import keepThingsUpdated from './cron/keepThingsUpdated';
import cors from 'cors';
import {env} from './config';
import {authorizeAndSetSupabaseUser} from '@shared/auth';
import {customAuthChecker} from '@shared/auth/graphql';

const app = express();

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

/************************************************************************************
 *                              Serve front-end content
 ***********************************************************************************/

async function bootstrap() {
  const schema = await buildSchema({
    resolvers,
    dateScalarMode: 'isoDate',
    authChecker: customAuthChecker,
  });

  // TODO consider pulling the server into a different file for creation
  const server = new ApolloServer({
    schema,
    debug: env !== 'production',
    context: (_req: express.Request, _res: express.Response): ApolloPrismaContext => {
      return {prisma: datastore};
    },
    // Need to figure out how to clear the cache after mutations
    // cache: new KeyvAdapter(new Keyv(process.env.REDIS_URL)),
  });
  server.start().then(() => {
    server.applyMiddleware({app, path: '/graphql'});
  });
}

bootstrap();

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

// keepThingsUpdated();

// Run the 3 minute cron
if (env !== 'production') {
  cron.schedule('*/3 * * * *', async () => {
    await keepThingsUpdated();
  });
}

/************************************************************************************
 *                              Export Server
 ***********************************************************************************/

export default app;
