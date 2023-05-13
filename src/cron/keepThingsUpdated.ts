import {getGamesBySeason} from '@shared/mysportsfeeds';
import {SEASON} from '@util/const';
import moment from 'moment';
import {markWinners} from './markWinners';
import updateGamesAndPicks from './updateGamesAndPicks';

export default async function keepThingsUpdated() {
  console.log('cron is running at ', moment().toString());

  const games = await getGamesBySeason(SEASON);

  await updateGamesAndPicks(games);
  await markWinners(SEASON);
}
