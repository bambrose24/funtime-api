import {getGamesBySeason} from '@shared/mysportsfeeds';
import {SEASON} from '@util/const';
import {logger} from '@util/logger';
import {markWinners} from './markWinners';
import updateGamesAndPicks from './updateGamesAndPicks';

export default async function keepThingsUpdated() {
  logger.info(`cron is running`);

  const games = await getGamesBySeason(SEASON);

  await updateGamesAndPicks(games);
  await markWinners(SEASON);
}
