import {MSFGame, SeasonOptions, WeekSeasonOptions} from './types';

function gamesURL({week, season}: WeekSeasonOptions) {
  return `https://api.mysportsfeeds.com/v2.1/pull/nfl/${season}-${season +
    1}-regular/week/${week}/games.json`;
}

function seasonURL({season}: SeasonOptions) {
  return `https://api.mysportsfeeds.com/v2.1/pull/nfl/${season}-regular/games.json`;
}

const API_PASSWORD = 'MYSPORTSFEEDS';

export class MSFClient {
  key: string;
  constructor(key: string) {
    this.key = key;
  }

  headers() {
    const base64Key = Buffer.from(`${this.key}:${API_PASSWORD}`).toString('base64');

    return {
      Authorization: `Basic ${base64Key}`,
    };
  }

  async getGamesByWeek({week, season}: WeekSeasonOptions): Promise<Array<MSFGame>> {
    const res = await fetch(gamesURL({week, season}), {
      headers: new Headers({
        ...this.headers(),
      }),
    });

    const json = await res.json();
    return json.games as Array<MSFGame>;
  }

  async getGamesBySeason({season}: SeasonOptions): Promise<Array<MSFGame>> {
    const res = await fetch(seasonURL({season}), {
      headers: new Headers({
        ...this.headers(),
      }),
    });

    const json = await res.json();
    return json.games as Array<MSFGame>;
  }
}
