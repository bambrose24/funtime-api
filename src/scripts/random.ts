import datastore from '@shared/datastore';
import {logger} from '@util/logger';

async function run() {
  // await datastore.pick.updateMany({data: {done: 1}, where: {leaguemembers: {league_id: {lte: 7}}}});
  const week2 = await datastore.pick.findMany({
    include: {winnerTeam: true, people: true},
    where: {leaguemembers: {league_id: 8}, week: 2},
  });

  logger.info(week2);
}

run();
