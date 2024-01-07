import {msf} from '@shared/dataproviders/mysportsfeeds';
import {DEFAULT_SEASON} from '@util/const';
import {logger} from '@util/logger';
import {markWinners} from './markWinners';
import updateGamesAndPicks from './updateGamesAndPicks';

export default async function keepThingsUpdated() {
  logger.info(`cron is running`);

  const games = await msf.getGamesBySeason({season: DEFAULT_SEASON});

  await updateGamesAndPicks(games);
  await markWinners(DEFAULT_SEASON);
}
