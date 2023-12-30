import {PrismaClient} from '@prisma/client';
import {withAccelerate} from '@prisma/extension-accelerate';

const datastore = new PrismaClient({
  // log: ["error", "info", "query", "warn"],
  log: ['error'],
}).$extends(withAccelerate());

// datastore.$use(cacheMiddleware);
export default datastore;
