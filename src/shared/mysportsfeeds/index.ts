import { Games } from "@prisma/client";
import { MSFGame, MSFGameSchedule } from "./types";

var MySportsFeeds = require("mysportsfeeds-node");

var msf = new MySportsFeeds("2.1", true);
msf.authenticate(process.env.MYSPORTSFEEDS_API_KEY, "MYSPORTSFEEDS");

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
export async function getGamesBySeason(
  season: number
): Promise<Array<MSFGameSchedule>> {
  try {
    const games = await msf.getData(
      "nfl",
      `${season}-${season + 1}-regular`,
      "seasonal_games",
      "json"
    );

    return games.games.map((g: any) => g.schedule);
  } catch (e) {
    console.log("error", e);
  }
  return [];
}

export async function getGamesByWeek(
  season: number,
  week: number
): Promise<Array<MSFGame>> {
  try {
    const games = await msf.getData(
      "nfl",
      `${season}-${season + 1}-regular`,
      "weekly_games",
      "json",
      { week }
    );

    return games.games.map((g: any) => g as MSFGame);
  } catch (e) {
    console.error("error getting weekly games", e);
  }
  return [];
}
