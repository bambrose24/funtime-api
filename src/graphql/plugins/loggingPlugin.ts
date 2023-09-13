import {ApolloServerPlugin} from '@apollo/server';
import {ApolloContext} from '@graphql/server/types';
import {logger} from '@util/logger';

export const loggingPlugin: ApolloServerPlugin<ApolloContext> = {
  requestDidStart({request, contextValue}) {
    return new Promise(resolve => {
      if (request.operationName) {
        logger.info(`[graphql] Running operation ${request.operationName}`);
      }

      resolve({
        async willSendResponse(requestContext) {
          if (requestContext.errors) {
            logger.error(
              `[graphql] Error running ${requestContext.operationName}: ${JSON.stringify(
                requestContext.errors
              )}`,
              requestContext
            );
          }
          logger.info(`[graphql] Finished running ${requestContext.operationName}`, requestContext);
          contextValue.transaction.finish();
        },
        // executionDidStart() {
        //   return new Promise(resolveExecution => {
        //     resolveExecution({
        //       willResolveField({contextValue, info}) {
        //         const span = contextValue.transaction.startChild({
        //           op: 'resolver',
        //           description: `${info.parentType.name}.${info.fieldName}`,
        //         });
        //         return () => {
        //           span.finish();
        //         };
        //       },
        //     });
        //   });
        // },
      });
    });
  },
};
