"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma_redis_middleware_1 = require("prisma-redis-middleware");
const ioredis_1 = __importDefault(require("ioredis"));
const redis = new ioredis_1.default(); // Uses default options for Redis connection
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore-error might work
const cacheMiddleware = (0, prisma_redis_middleware_1.createPrismaRedisCache)({
    models: [
        { model: "User", excludeMethods: ["findMany"] },
        { model: "Post", cacheTime: 180, cacheKey: "article" },
    ],
    storage: {
        type: "redis",
        options: {
            client: redis,
            invalidation: { referencesTTL: 300 },
            log: console,
        },
    },
    cacheTime: 300,
    excludeModels: ["Product", "Cart"],
    excludeMethods: ["count", "groupBy"],
    onHit: (key) => {
        console.log("hit", key);
    },
    onMiss: (key) => {
        console.log("miss", key);
    },
    onError: (key) => {
        console.log("error", key);
    },
});
const datastore = new client_1.PrismaClient();
datastore.$use(cacheMiddleware);
exports.default = datastore;
