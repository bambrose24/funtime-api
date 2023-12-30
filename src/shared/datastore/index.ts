require('dotenv').config();
import {Prisma, PrismaClient} from '@prisma/client';
import {Operation} from '@prisma/client/runtime/library';
import {withAccelerate} from '@prisma/extension-accelerate';
import {memoryCache} from '@shared/caching/memory';
import {logger} from '@util/logger';
import stringify from 'json-stable-stringify';

type CacheArgs = {
  ttl?: number;
};
const readOperations: Operation[] = [
  'aggregate',
  'findFirstOrThrow',
  'findFirst',
  'findMany',
  'findUnique',
  'findUniqueOrThrow',
];

const getTTLExtension = (ttl: number) => {
  return Prisma.defineExtension({
    query: {
      $allModels: {
        $allOperations: async ({args, query, operation}) => {
          if (readOperations.includes(operation)) {
            // TODO look at cache
            const key = stringify(args);
            const cachedResult = memoryCache.get<ReturnType<typeof query>>(key);
            if (cachedResult) {
              logger.info(`prisma_cache_hit`, {operation});
              return cachedResult;
            }
            logger.info(`prisma_cache_miss`, {operation});
            const result = await query(args);
            memoryCache.set(key, result, ttl);
            return result;
          }
          return query(args);
        },
      },
    },
  });
};

const datastore = new PrismaClient({
  // log: ["error", "info", "query", "warn"],
  log: ['error'],
}).$extends(getTTLExtension(15));

// datastore.$use(cacheMiddleware);
export {datastore};
