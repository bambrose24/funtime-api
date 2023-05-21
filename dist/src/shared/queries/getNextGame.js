"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextGame = void 0;
const datastore_1 = __importDefault(require("@shared/datastore"));
async function getNextGame(overrideTs) {
    const now = overrideTs ?? new Date();
    const games = await datastore_1.default.game.findMany({
        where: { ts: { gt: now } },
        orderBy: { ts: 'asc' },
        take: 1,
    });
    if (games && games.length > 0) {
        return games[0];
    }
    return null;
}
exports.getNextGame = getNextGame;
