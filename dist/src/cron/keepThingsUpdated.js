"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysportsfeeds_1 = require("@shared/mysportsfeeds");
const moment_1 = __importDefault(require("moment"));
async function keepThingsUpdated() {
    console.log("cron is running at ", (0, moment_1.default)().toString());
    const games = await (0, mysportsfeeds_1.getGamesBySeason)(2022);
    // call updateGamesAndPicks when that's done
}
exports.default = keepThingsUpdated;
