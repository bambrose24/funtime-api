import {getGamesBySeason} from '@shared/mysportsfeeds';
import {DEFAULT_SEASON} from '@util/const';
import {logger} from '@util/logger';
import {markWinners} from './markWinners';
import updateGamesAndPicks from './updateGamesAndPicks';

export default async function keepThingsUpdated() {
  logger.info(`cron is running`);

  const games = await getGamesBySeason(DEFAULT_SEASON);

  await updateGamesAndPicks(games);
  await markWinners(DEFAULT_SEASON);
}
