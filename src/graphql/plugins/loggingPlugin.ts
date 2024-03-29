import {ApolloServerPlugin} from '@apollo/server';
import {ApolloContext} from '@graphql/server/types';
import {logger} from '@util/logger';

const IGNORE_OPERATION_NAMES = ['IntrospectionQuery'];

export const loggingPlugin: ApolloServerPlugin<ApolloContext> = {
  requestDidStart({request, contextValue}) {
    const startTime = new Date();
    return new Promise(resolve => {
      if (request.operationName && !IGNORE_OPERATION_NAMES.includes(request.operationName)) {
        logger.info(`[graphql] Running operation ${request.operationName}`, {
          operationName: request.operationName,
          query: request.query,
          variables: request.variables,
        });
      }

      resolve({
        async willSendResponse() {
          const endTime = new Date();
          const totalTimeMs = endTime.valueOf() - startTime.valueOf();
          if (request.operationName && !IGNORE_OPERATION_NAMES.includes(request.operationName)) {
            logger.info(`[graphql] Operation time log`, {
              operationName: request.operationName,
              query: request.query,
              variables: request.variables,
              graphqlRequestTimeMs: totalTimeMs,
            });
          }
        },
      });
    });
  },
};
