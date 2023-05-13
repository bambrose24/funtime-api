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
    // const res = await datastore.games.createMany({ data: dbGames });
}
function convertToDBGameForCreation(season, game, teamsMap) {
    return {
        home: teamsMap[game.homeTeam.abbreviation].teamid,
        homescore: 0,
        away: teamsMap[game.awayTeam.abbreviation].teamid,
        awayscore: 0,
        season,
        week: game.week,
        ts: new Date(game.startTime),
        seconds: new Date(game.startTime).getTime() / 1000,
        done: false,
        winner: null,
    };
}
run();
