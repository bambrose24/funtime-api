require('dotenv').config();
import {PrismaClient} from '@prisma/client';
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
const datastore = new PrismaClient({
  // log: ["error", "info", "query", "warn"],
  log: ['error'],
}).$extends({
  client: {},
  query: {
    $allModels: {
      $allOperations: async ({args, query, operation}) => {
        if (readOperations.includes(operation)) {
          // TODO look at redis
          return query(args);
        }
        return query(args);
      },
    },
  },
});

// datastore.$use(cacheMiddleware);
export default datastore;
