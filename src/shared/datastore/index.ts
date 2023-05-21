import {PrismaClient} from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// This technically would have worked if I figured out the GraphQL Scalar problem
// for DateTimes sooner
// const cacheMiddleware: Prisma.Middleware = createPrismaRedisCache({
//   models: [
//     { model: "People", cacheKey: "uid" },
//     { model: "Games", cacheKey: "gid" },
//     { model: "LeagueMembers", cacheKey: "membership_id" },
//     { model: "Leagues", cacheKey: "league_id" },
//     { model: "Picks", cacheKey: "pickid" },
//     { model: "Superbowl", cacheKey: "pickid" },
//     { model: "SuperbowlSquares", cacheKey: "square_id" },
//     { model: "Teams", cacheKey: "teamid" },
//   ],
//   storage: {
//     type: "memory",
//     options: {
//       size: 2048,
//       invalidation: true,
//       log: undefined,
//     },
//   },
//   cacheTime: 30000,
//   onHit: (key) => {
//     console.log("hit", key);
//   },
//   onMiss: (key) => {
//     console.log("miss", key);
//   },
//   onError: (key) => {
//     console.log("error", key);
//   },
// });

const datastore = new PrismaClient({
  // log: ["error", "info", "query", "warn"],
  log: ['error'],
});

// datastore.$use(cacheMiddleware);
export default datastore;
