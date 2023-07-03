"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-unsafe-argument */
if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    require('dotenv').config();
}
const datastore_1 = __importDefault(require("@shared/datastore"));
const mysportsfeeds_1 = require("@shared/mysportsfeeds");
const const_1 = require("@util/const");
const lodash_1 = __importDefault(require("lodash"));
async function run() {
    const games = await (0, mysportsfeeds_1.getGamesBySeason)(const_1.SEASON);
    const teams = await datastore_1.default.team.findMany({
        where: { teamid: { gte: 0 } },
    });
    const teamsMap = {};
    teams.forEach(t => {
        teamsMap[t.abbrev] = t;
    });
    const dbGames = games.map((g) => convertToDBGameForCreation(const_1.SEASON, g, teamsMap));
    console.log(`prepped ${dbGames.length} games to input`);
    const res = await datastore_1.default.game.createMany({ data: dbGames });
    console.log(`created ${res.count} games for ${const_1.SEASON}`);
    const newGames = await datastore_1.default.game.findMany({ where: { season: const_1.SEASON } });
    const weeks = new Set(newGames.map(g => g.week));
    for (const week of [...weeks]) {
        let maxGame;
        const weekGames = newGames.filter(g => g.week === week);
        const maxGameTs = lodash_1.default.maxBy(weekGames, 'ts');
        if (!maxGameTs) {
            throw new Error(`Could not figure out the max game ts for week ${week}`);
        }
        const otherGames = weekGames.filter(g => g.ts.getTime() === maxGameTs.ts.getTime());
        if (otherGames.length > 1) {
            maxGame = lodash_1.default.maxBy(otherGames, 'msf_id');
        }
        else {
            maxGame = maxGameTs;
        }
        await datastore_1.default.game.update({ where: { gid: maxGame.gid }, data: { is_tiebreaker: true } });
    }
}
function convertToDBGameForCreation(season, game, teamsMap) {
    return {
        home: teamsMap[game.schedule.homeTeam.abbreviation].teamid,
        homescore: 0,
        away: teamsMap[game.schedule.awayTeam.abbreviation].teamid,
        awayscore: 0,
        season,
        week: game.schedule.week,
        ts: new Date(game.schedule.startTime),
        seconds: new Date(game.schedule.startTime).getTime() / 1000,
        done: false,
        winner: null,
        msf_id: game.schedule.id,
    };
}
run();
