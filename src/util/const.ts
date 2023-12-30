import { PrismaCacheStrategy } from "@prisma/extension-accelerate";

export const DEFAULT_SEASON = 2023;


export const PRISMA_CACHES = {
  oneDay: {
    ttl: 60 * 60 * 24,
  swr: 60 * 60 * 24,
  }, 
  oneHour: {ttl: 60 * 60,
    swr: 60 * 60,},
    oneMinute: {ttl: 60,
      swr: 60,}
} satisfies Record<string, PrismaCacheStrategy['cacheStrategy']>