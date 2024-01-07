import {memoryCache} from '../caching/memory';
import {MSFGame} from './types';

import AsyncLock from 'async-lock';
import {logger} from '@util/logger';
// import {RequestContext} from '@util/request-context';

var MySportsFeeds = require('mysportsfeeds-node');

var msf = new MySportsFeeds('2.1', true);
msf.authenticate(process.env.MYSPORTSFEEDS_API_KEY, 'MYSPORTSFEEDS');

var msfLock = new AsyncLock();

/*

game.schedule: {
  id: 71714,
  week: 1,
  startTime: '2022-09-09T00:20:00.000Z',
  endedTime: null,
  awayTeam: { id: 48, abbreviation: 'BUF' },
  homeTeam: { id: 77, abbreviation: 'LA' },
  venue: { id: 162, name: 'SoFi Stadium' },
  venueAllegiance: 'HOME',
  scheduleStatus: 'NORMAL',
  originalStartTime: null,
  delayedOrPostponedReason: null,
  playedStatus: 'UNPLAYED',
  attendance: null,
  officials: [],
  broadcasters: [ 'NBC' ],
  weather: null
}
game.score: {
    currentQuarter: null,
    currentQuarterSecondsRemaining: null,
    currentIntermission: null,
    teamInPossession: null,
    currentDown: null,
    currentYardsRemaining: null,
    lineOfScrimmage: null,
    awayScoreTotal: null,
    homeScoreTotal: null,
    quarters: []
  }
*/
export async function getGamesBySeason(season: number): Promise<Array<MSFGame>> {
  try {
    const games = await msf.getData(
      'nfl',
      `${season}-${season + 1}-regular`,
      'seasonal_games',
      'json'
    );
    return games.games.map((g: any) => g as MSFGame);
  } catch (e) {
    logger.error('error getting games by season', e);
  }
  return [];
}

function getWeekKey({season, week}: {season: number; week: number}): string {
  return `msf_week_${week}_${season}`;
}

export async function getGamesByWeek(
  season: number,
  week: number,
  useRedis: boolean = false
): Promise<Array<MSFGame>> {
  try {
    const key = getWeekKey({season, week});

    // First, check the memory cache
    // const cachedGames = await RequestContext.get('getGamesByWeek', {week, season});
    // if (cachedGames) {
    //   return cachedGames;
    // }
    const memoryCacheResult = memoryCache.get<Array<MSFGame>>(key);
    if (memoryCacheResult) {
      logger.info(`Returning getGamesByWeek data from memory cache for ${season} ${week}`);
      return memoryCacheResult;
    }
    logger.info(`Could not find getGamesByWeek in cache for ${season} ${week}`);

    const games = await msf.getData(
      'nfl',
      `${season}-${season + 1}-regular`,
      'weekly_games',
      'json',
      {week}
    );

    const res = games.games.map((g: any) => g as MSFGame);
    memoryCache.set(key, res);
    return res;
  } catch (e) {
    logger.error('error getting weekly games', e);
  }
  return [];
}
