import {ApolloServerPlugin} from '@apollo/server';
import {ApolloContext} from '@graphql/server/types';
import {logger} from '@util/logger';

export const loggingPlugin: ApolloServerPlugin<ApolloContext> = {
  requestDidStart({request, contextValue}) {
    return new Promise(resolve => {
      if (request.operationName) {
        logger.info(`[graphql] Running operation ${request.operationName}`, {
          operationName: request.operationName,
          query: request.query,
          variables: request.variables,
        });
      }

      resolve({});
    });
  },
};
