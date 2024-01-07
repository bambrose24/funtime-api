import {provider} from '@shared/dataproviders';
import {DEFAULT_SEASON} from '@util/const';
import {logger} from '@util/logger';
import {markWinners} from './markWinners';
import updateGamesAndPicks from './updateGamesAndPicks';

export default async function keepThingsUpdated() {
  logger.info(`cron is running`);

  const games = await provider.getGamesBySeason({season: DEFAULT_SEASON});

  await updateGamesAndPicks(games);
  await markWinners(DEFAULT_SEASON);
}
