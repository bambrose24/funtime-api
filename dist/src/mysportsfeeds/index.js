"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGamesBySeason = void 0;
var MySportsFeeds = require("mysportsfeeds-node");
var msf = new MySportsFeeds("2.0", true);
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
async function getGamesBySeason(season) {
    console.log("api key");
    try {
        const games = await msf.getData("nfl", `${season}-${season + 1}-regular`, "seasonal_games", "json");
        console.log("game?", games.games[0]);
        return games.games.map((g) => g.schedule);
    }
    catch (e) {
        console.log("error", e);
    }
}
exports.getGamesBySeason = getGamesBySeason;
// export function convertToDBGameForAddition(game: any): Games {}
