"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const datastore_1 = __importDefault(require("@shared/datastore"));
const types_1 = require("@shared/mysportsfeeds/types");
const lodash_1 = __importDefault(require("lodash"));
const moment_1 = __importDefault(require("moment"));
const register_1 = require("../graphql/resolvers/register");
async function updateGamesAndPicks(games) {
    const [dbGames, teams] = await Promise.all([
        datastore_1.default.game.findMany({
            where: {
                season: { equals: register_1.SEASON },
                week: { in: games.map((g) => g.schedule.week) },
            },
        }),
        datastore_1.default.team.findMany({ where: { teamid: { gt: 0 } } }),
    ]);
    const teamsMap = teams.reduce((prev, curr) => {
        prev[curr.teamid] = curr;
        return prev;
    }, {});
    const gamesChunked = lodash_1.default.chunk(dbGames, 5);
    for (let dbGamesChunk of gamesChunked) {
        dbGamesChunk.forEach(async (dbGame) => {
            // if (dbGame.done) {
            //   return;
            // }
            const homeTeam = teamsMap[dbGame.home];
            const awayTeam = teamsMap[dbGame.away];
            const msfGame = games.find((g) => g.schedule.homeTeam.abbreviation === homeTeam.abbrev &&
                g.schedule.awayTeam.abbreviation === awayTeam.abbrev);
            if (!msfGame) {
                console.log(`[cron] could not find msf game for ${awayTeam.abbrev}@${homeTeam.abbrev}`);
            }
            const homeScore = msfGame?.score.homeScoreTotal;
            const awayScore = msfGame?.score.awayScoreTotal;
            if (msfGame?.schedule.playedStatus === types_1.MSFGamePlayedStatus.COMPLETED &&
                homeScore !== null &&
                awayScore !== null) {
                const winner = homeScore === awayScore
                    ? null
                    : homeScore > awayScore
                        ? dbGame.home
                        : dbGame.away;
                // game is done, time to update picks and dbGame.done = true
                const picks = await datastore_1.default.pick.findMany({
                    where: { gid: dbGame.gid },
                });
                console.info(`[cron] setting game ${dbGame.gid} to done`);
                const awayRecord = getRecord(dbGames, dbGame, dbGame.away);
                const homeRecord = getRecord(dbGames, dbGame, dbGame.home);
                const gameUpdateData = {
                    done: true,
                    winner,
                    homescore: homeScore,
                    awayscore: awayScore,
                    homerecord: homeRecord,
                    awayrecord: awayRecord,
                    ...(msfGame?.schedule.startTime
                        ? { ts: (0, moment_1.default)(msfGame.schedule.startTime).toDate() }
                        : {}),
                };
                await datastore_1.default.game.update({
                    where: { gid: dbGame.gid },
                    data: gameUpdateData,
                });
                console.info(`[cron] updating picks for ${dbGame.gid}`);
                const correctPickIds = [];
                const wrongPickIds = [];
                picks.forEach(async (p) => {
                    let correct = false;
                    if (winner === null || p.winner === winner) {
                        correct = true;
                        correctPickIds.push(p.pickid);
                    }
                    else {
                        wrongPickIds.push(p.pickid);
                    }
                });
                await datastore_1.default.pick.updateMany({
                    where: { pickid: { in: correctPickIds } },
                    data: { correct: 1 },
                });
                await datastore_1.default.pick.updateMany({
                    where: { pickid: { in: wrongPickIds } },
                    data: { correct: 0 },
                });
            }
        });
    }
}
exports.default = updateGamesAndPicks;
function getRecord(dbGames, currGame, teamId) {
    const prevGamesWithTeam = dbGames.filter((g) => (g.home === teamId || g.away === teamId) && g.week < currGame.week);
    const wins = prevGamesWithTeam.filter((g) => g.winner === teamId).length;
    const losses = prevGamesWithTeam.filter((g) => g.winner && g.winner !== teamId).length;
    const ties = prevGamesWithTeam.filter((g) => !g.winner).length;
    if (ties) {
        return `${wins}-${losses}-${ties}`;
    }
    return `${wins}-${losses}`;
}
