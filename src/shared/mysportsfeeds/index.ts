import {memoryCache} from '../caching/memory';
import {MSFGame} from './types';

import AsyncLock from 'async-lock';

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
    console.log('error getting games by season', e);
  }
  return [];
}

function getWeekKey(options: {season: number; week: number}): string {
  return `msf_week_${options.week}_${options.season}`;
}

export async function getGamesByWeek(
  season: number,
  week: number,
  useRedis: boolean = false
): Promise<Array<MSFGame>> {
  try {
    console.log('getGamesByWeek week season', week, season);
    const key = getWeekKey({season, week});

    // First, check the memory cache
    const memoryCacheResult = memoryCache.get<Array<MSFGame>>(key);
    if (memoryCacheResult) {
      console.log('Returning data from memory cache');
      return memoryCacheResult;
    }

    // If using Redis, check Redis cache here before the lock (similar to the memory cache check)
    // If data is found in Redis, return it.

    // If data is not in caches, acquire the lock and make the API call
    return await msfLock.acquire(key, async () => {
      // Double-check the cache after acquiring the lock in case another request populated it while waiting
      const postLockMemoryCacheResult = memoryCache.get<Array<MSFGame>>(key);
      if (postLockMemoryCacheResult) {
        return postLockMemoryCacheResult;
      }

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
    });
  } catch (e) {
    console.error('error getting weekly games', e);
  }
  return [];
}
