"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const markWinners_1 = require("@cron/markWinners");
async function run() {
    for (let i = 2014; i <= 2023; i++) {
        await (0, markWinners_1.markWinners)(i);
    }
}
run();
