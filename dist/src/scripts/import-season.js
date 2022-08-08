"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-unsafe-argument */
if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    require("dotenv").config();
}
const datastore_1 = __importDefault(require("@shared/datastore"));
const mysportsfeeds_1 = require("@shared/mysportsfeeds");
async function run() {
    const season = 2022;
    const games = await (0, mysportsfeeds_1.getGamesBySeason)(season);
    const teams = await datastore_1.default.teams.findMany({
        where: { teamid: { gte: 0 } },
    });
    const teamsMap = {};
    teams.forEach((t) => {
        teamsMap[t.abbrev] = t;
    });
    const dbGames = games.map((g) => convertToDBGameForCreation(season, g, teamsMap));
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
        seconds: BigInt(new Date(game.startTime).getTime() / 1000),
        done: false,
        winner: null,
    };
}
run();
