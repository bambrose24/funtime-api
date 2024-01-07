import {getGamesBySeason_DEPRECATED} from '@shared/mysportsfeeds/old';
import {DEFAULT_SEASON} from '@util/const';
import {logger} from '@util/logger';
import {markWinners} from './markWinners';
import updateGamesAndPicks from './updateGamesAndPicks';

export default async function keepThingsUpdated() {
  logger.info(`cron is running`);

  const games = await getGamesBySeason_DEPRECATED(DEFAULT_SEASON);

  await updateGamesAndPicks(games);
  await markWinners(DEFAULT_SEASON);
}
