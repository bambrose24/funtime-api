"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const datastore_1 = __importDefault(require("@shared/datastore"));
const types_1 = require("@shared/mysportsfeeds/types");
const moment_1 = __importDefault(require("moment"));
const register_1 = require("src/graphql/resolvers/register");
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
    await dbGames.forEach(async (dbGame) => {
        if (dbGame.done) {
            return;
        }
        console.info(`[cron] updating game ${dbGame.gid}`);
        const homeTeam = teamsMap[dbGame.home];
        const awayTeam = teamsMap[dbGame.away];
        const msfGame = games.find((g) => g.schedule.homeTeam.abbreviation === homeTeam.abbrev &&
            g.schedule.awayTeam.abbreviation === awayTeam.abbrev);
        if (!msfGame) {
            console.log("could not find");
        }
        const homeScore = msfGame?.score.homeScoreTotal;
        const awayScore = msfGame?.score.awayScoreTotal;
        if (msfGame?.schedule.playedStatus === types_1.MSFGamePlayedStatus.COMPLETED &&
            homeScore !== null &&
            awayScore !== null) {
            // game is done, time to update picks and dbGame.done = true
            const picks = await datastore_1.default.pick.findMany({
                where: { gid: dbGame.gid },
            });
            console.info(`[cron] setting game ${dbGame.gid} to done`);
            await datastore_1.default.game.update({
                data: {
                    done: true,
                },
                where: {
                    gid: dbGame.gid,
                },
            });
            console.info(`[cron] updating picks for ${dbGame.gid}`);
            await picks.forEach(async (p) => {
                let correct = false;
                if (homeScore === awayScore ||
                    (homeScore > awayScore && p.winner === homeTeam.teamid) ||
                    (awayScore > homeScore && p.winner == awayTeam.teamid)) {
                    correct = true;
                }
                console.info(`[cron] setting pick ${p.pickid} as correct ${correct}`);
                await datastore_1.default.pick.update({
                    where: { pickid: p.pickid },
                    data: { correct: correct ? 1 : 0 },
                });
            });
        }
        if (homeScore !== null && awayScore !== null) {
            const data = {
                homescore: homeScore,
                awayscore: awayScore,
            };
            if (msfGame?.schedule.startTime) {
                data["ts"] = (0, moment_1.default)(msfGame.schedule.startTime).toDate();
            }
            console.info(`[cron] setting ${dbGame.gid} to data ${JSON.stringify(data)}`);
            await datastore_1.default.game.update({
                where: { gid: dbGame.gid },
                data,
            });
        }
    });
}
exports.default = updateGamesAndPicks;
