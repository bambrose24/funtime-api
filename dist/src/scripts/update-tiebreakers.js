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
const datastore_1 = __importDefault(require("@src/datastore"));
async function run() {
    const games = await datastore_1.default.games.findMany({
        where: { season: { equals: 2022 } },
        orderBy: { ts: "asc" },
    });
    const weeks = new Set(games.map((g) => g.week));
    const gamesToMakeTiebreakers = [];
    weeks.forEach((week) => {
        const weekGames = games.filter((g) => g.week === week);
        gamesToMakeTiebreakers.push(weekGames[weekGames.length - 1]);
    });
    await datastore_1.default.games.updateMany({
        where: {
            gid: { in: gamesToMakeTiebreakers.map((g) => g.gid) },
        },
        data: { is_tiebreaker: true },
    });
}
run();
