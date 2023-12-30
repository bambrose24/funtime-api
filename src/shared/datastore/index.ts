require('dotenv').config();
import {Prisma, PrismaClient} from '@prisma/client';
import {Operation} from '@prisma/client/runtime/library';
import {withAccelerate} from '@prisma/extension-accelerate';
console.log('SUPABASE_DB_PRISMA ?? ', process.env.SUPABASE_DB_PRISMA);

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
        $allOperations: ({args, query, operation}) => {
          if (readOperations.includes(operation)) {
            // TODO look at redis
            return query(args);
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
});

// datastore.$use(cacheMiddleware);
export {datastore};
