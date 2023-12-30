import {datastore} from '@shared/datastore';
import {Transaction} from '@sentry/types';

export type ApolloContext = {
  prisma: typeof datastore;
  transaction: Transaction;
};
