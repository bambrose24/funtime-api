/* eslint-disable @typescript-eslint/no-unsafe-argument */
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  require('dotenv').config();
}
import {msf} from '@shared/dataproviders/mysportsfeeds';
import {logger} from '@util/logger';

async function run() {
  const games = await msf.getGamesByWeek({season: 2022, week: 1});
  logger.info(games[0]);
}

run();
