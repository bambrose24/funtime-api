if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
import morgan from "morgan";
import helmet from "helmet";
import StatusCodes from "http-status-codes";
import express, { NextFunction, Request, Response } from "express";

import "express-async-errors";
import logger from "jet-logger";

import { CustomError } from "./shared/errors";
import { ApolloServer } from "apollo-server-express";

import { resolvers as generatedResolvers } from "@generated/type-graphql";
import { buildSchema } from "type-graphql";
import datastore from "@shared/datastore";

import resolvers from "./graphql/resolvers";

const app = express();

/************************************************************************************
 *                              Set basic express settings
 ***********************************************************************************/

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Show routes called in console during development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Security
if (process.env.NODE_ENV === "production") {
  app.use(helmet());
}

// Error handling
app.use(
  (err: Error | CustomError, _: Request, res: Response, __: NextFunction) => {
    logger.err(err, true);
    const status =
      err instanceof CustomError ? err.HttpStatus : StatusCodes.BAD_REQUEST;
    return res.status(status).json({
      error: err.message,
    });
  }
);

/************************************************************************************
 *                              Serve front-end content
 ***********************************************************************************/

async function bootstrap() {
  const schema = await buildSchema({
    resolvers: [...generatedResolvers, ...resolvers],
  });

  const server = new ApolloServer({
    schema,
    context: () => ({ prisma: datastore }),
  });
  server.start().then(() => server.applyMiddleware({ app, path: "/graphql" }));
}

bootstrap();

/************************************************************************************
 *                              Export Server
 ***********************************************************************************/

export default app;
