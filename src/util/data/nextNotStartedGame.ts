import datastore from '@shared/datastore';
import {SEASON} from '@util/const';

export async function nextNotStartedGame() {
  const currentSeason = SEASON;
  const now = new Date();
  return await datastore.game.findFirst({
    where: {season: currentSeason, ts: {gte: now}},
    orderBy: {ts: 'asc'},
  });
}
