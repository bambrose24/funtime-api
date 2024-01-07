import {logger} from '@util/logger';
import {NFLDataProvider} from '../nfl-dataprovider-client';
import {DataProviderGame, SeasonOptions, WeekSeasonOptions} from '../types';
import {MSFGame, MSFGamePlayedStatus} from './types';

function gamesURL({week, season}: WeekSeasonOptions) {
  return `https://api.mysportsfeeds.com/v2.1/pull/nfl/${season}-${season +
    1}-regular/week/${week}/games.json`;
}

function seasonURL({season}: SeasonOptions) {
  return `https://api.mysportsfeeds.com/v2.1/pull/nfl/${season}-regular/games.json`;
}

const API_PASSWORD = 'MYSPORTSFEEDS';

export class MSFClient extends NFLDataProvider {
  key: string;
  constructor(key: string) {
    super();
    this.key = key;
  }

  headers() {
    const base64Key = Buffer.from(`${this.key}:${API_PASSWORD}`).toString('base64');

    return {
      Authorization: `Basic ${base64Key}`,
    };
  }

  async getGamesByWeek({week, season}: WeekSeasonOptions): Promise<Array<DataProviderGame>> {
    logger.info(`Fetching games by week ${week} ${season}`);
    const res = await fetch(gamesURL({week, season}), {
      headers: new Headers({
        ...this.headers(),
      }),
    });

    const json = await res.json();
    const msfGames = json.games as Array<MSFGame>;
    return msfGames.map(g => this.convertMSFGame({g, season}));
  }

  async getGamesBySeason({season}: SeasonOptions): Promise<Array<DataProviderGame>> {
    logger.info(`Fetching games by season ${season}`);
    const res = await fetch(seasonURL({season}), {
      headers: new Headers({
        ...this.headers(),
      }),
    });

    const json = await res.json();
    const msfGames = json.games as Array<MSFGame>;
    return msfGames.map(g => this.convertMSFGame({g, season}));
  }

  private convertMSFGame({g, season}: {g: MSFGame; season: number}): DataProviderGame {
    return {
      id: g.schedule.id.toString(),
      season,
      week: g.schedule.week,
      awayAbbrev: g.schedule.awayTeam.abbreviation,
      homeAbbrev: g.schedule.homeTeam.abbreviation,
      awayScore: g.score.awayScoreTotal ?? 0,
      homeScore: g.score.homeScoreTotal ?? 0,
      startTime: new Date(g.schedule.startTime),
      quarter: g.score.currentQuarter,
      secondsInQuarter: g.score.currentQuarterSecondsRemaining,
      endedTime: null,
      status: this.convertMSFStatus(g.schedule.playedStatus),
    };
  }

  private convertMSFStatus(
    status: MSFGame['schedule']['playedStatus']
  ): DataProviderGame['status'] {
    switch (status) {
      case MSFGamePlayedStatus.COMPLETED:
      case MSFGamePlayedStatus.COMPLETED_PENDING_REVIEW:
        return 'done';
      case MSFGamePlayedStatus.LIVE:
        return 'in_progress';
      case MSFGamePlayedStatus.UNPLAYED:
        return 'not_started';
    }
  }
}
