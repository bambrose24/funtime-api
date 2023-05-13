"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysportsfeeds_1 = require("@shared/mysportsfeeds");
const const_1 = require("@util/const");
const moment_1 = __importDefault(require("moment"));
const markWinners_1 = require("./markWinners");
const updateGamesAndPicks_1 = __importDefault(require("./updateGamesAndPicks"));
async function keepThingsUpdated() {
    console.log('cron is running at ', (0, moment_1.default)().toString());
    const games = await (0, mysportsfeeds_1.getGamesBySeason)(const_1.SEASON);
    await (0, updateGamesAndPicks_1.default)(games);
    await (0, markWinners_1.markWinners)(const_1.SEASON);
}
exports.default = keepThingsUpdated;
