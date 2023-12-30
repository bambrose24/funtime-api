require('dotenv').config();
import {PrismaClient} from '@prisma/client';
import {withAccelerate} from '@prisma/extension-accelerate';
console.log('SUPABASE_DB_PRISMA ?? ', process.env.SUPABASE_DB_PRISMA);
const datastore = new PrismaClient({
  // log: ["error", "info", "query", "warn"],
  log: ['error'],
}).$extends(withAccelerate());

// datastore.$use(cacheMiddleware);
export default datastore;
