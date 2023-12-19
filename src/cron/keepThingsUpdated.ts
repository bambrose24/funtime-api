import {getGamesBySeason} from '@shared/mysportsfeeds';
import {SEASON} from '@util/const';
import {logger} from '@util/logger';
import moment from 'moment';
import {markWinners} from './markWinners';
import updateGamesAndPicks from './updateGamesAndPicks';

export default async function keepThingsUpdated() {
  logger.info(`cron is running`);

  const games = await getGamesBySeason(SEASON);

  await updateGamesAndPicks(games);
  await markWinners(SEASON);

  // run for 2022 because I messed up and deleted the week 15 winner for league_id 7
  const gamesOld = await getGamesBySeason(SEASON - 1);

  await updateGamesAndPicks(gamesOld);
  await markWinners(SEASON - 1);
}
