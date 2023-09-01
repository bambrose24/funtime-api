import {ApolloServerPlugin} from '@apollo/server';
import {ApolloContext} from '@graphql/server/types';

// https://blog.sentry.io/guest-post-performance-monitoring-in-graphql/
export const sentryPlugin: ApolloServerPlugin<ApolloContext> = {
  requestDidStart({request, contextValue}) {
    return new Promise(resolve => {
      if (request.operationName) {
        contextValue.transaction.setName(request.operationName);
      }

      resolve({
        async willSendResponse() {
          contextValue.transaction.finish();
        },
        executionDidStart() {
          return new Promise(resolveExecution => {
            resolveExecution({
              willResolveField({contextValue, info}) {
                const span = contextValue.transaction.startChild({
                  op: 'resolver',
                  description: `${info.parentType.name}.${info.fieldName}`,
                });
                return () => {
                  span.finish();
                };
              },
            });
          });
        },
      });
    });
  },
};
