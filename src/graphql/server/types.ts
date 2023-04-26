import datastore from '@shared/datastore';

export type ApolloPrismaContext = {
  prisma: typeof datastore;
};
