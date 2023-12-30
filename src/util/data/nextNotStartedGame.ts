import datastore from '@shared/datastore';
import {DEFAULT_SEASON, PRISMA_CACHES} from '@util/const';

export async function nextNotStartedGame() {
  const currentSeason = DEFAULT_SEASON;
  const now = new Date();
  return await datastore.game.findFirst({
    where: {season: currentSeason, ts: {gte: now}},
    orderBy: {ts: 'asc'},
    // cacheStrategy PRISMA_CACHES.oneMinute,
  });
}
