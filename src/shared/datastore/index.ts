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
        $allOperations: async ({args, query, operation, model}) => {
          const startTime = Date.now();
          logger.info(`prisma_operation`, {operation, model});
          if (readOperations.includes(operation)) {
            logger.info(`prisma_read`, {operation, model});
            // TODO look at cache
            const prismaOperationCacheKey = {model, operation, args};
            const key = stringify({prismaOperationCacheKey});
            const cachedResult = memoryCache.get<ReturnType<typeof query>>(key);
            if (cachedResult) {
              const endTime = Date.now();
              const operationTime = endTime - startTime;
              logger.info(`prisma_cache_hit`, {operation, model, operationTime});

              return cachedResult;
            }
            const result = await query(args);

            const endTime = Date.now();
            const operationTime = endTime - startTime;

            logger.info(`prisma_cache_miss`, {operation, model, operationTime});
            memoryCache.set(key, result, ttl);
            return result;
          }
          // clear the cache because it's not a read happening
          logger.info(`prisma_non_read`, {operation, model});
          // memoryCache.flushAll();
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
