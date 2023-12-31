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
          logger.info(`prisma_operation_start`, {prismaOperation: operation, prismaModel: model});
          if (readOperations.includes(operation)) {
            logger.info(`prisma_read`, {operation, model});
            // TODO look at cache
            const prismaOperationCacheKey = {model, operation, args};
            const key = stringify({prismaOperationCacheKey});
            const cachedResult = memoryCache.get<ReturnType<typeof query>>(key);
            if (cachedResult) {
              const endTime = Date.now();
              const operationTime = endTime - startTime;
              logger.info(`prisma_cache_hit`, {
                prismaOperation: operation,
                prismaModel: model,
                prismaOperationTime: operationTime,
              });

              return cachedResult;
            }
            const result = await query(args);

            const endTime = Date.now();
            const operationTime = endTime - startTime;

            logger.info(`prisma_cache_miss`, {
              prismaOperation: operation,
              prismaModel: model,
              prismaOperationTime: operationTime,
            });
            memoryCache.set(key, result, ttl);
            return result;
          }

          logger.info(`prisma_non_read`, {prismaOperation: operation, prismaModel: model});

          // clear the cache because it's not a read happening
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
}).$extends(getTTLExtension(30));

// datastore.$use(cacheMiddleware);
export {datastore};
