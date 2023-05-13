"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-unsafe-argument */
if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    require('dotenv').config();
}
const mysportsfeeds_1 = require("../shared/mysportsfeeds");
async function run() {
    const games = await (0, mysportsfeeds_1.getGamesByWeek)(2022, 1);
    console.log(games[0]);
}
run();
