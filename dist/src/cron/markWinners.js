"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markWinners = void 0;
const datastore_1 = __importDefault(require("@shared/datastore"));
const winner_1 = require("@shared/winner");
async function markWinners(season) {
    const [leaguesForSeason, games] = await Promise.all([
        datastore_1.default.league.findMany({ where: { season } }),
        datastore_1.default.game.findMany({ where: { season }, select: { gid: true, week: true } }),
    ]);
    const seasonWeeks = Array.from(new Set(games.map(g => g.week)));
    for (const league of leaguesForSeason) {
        const { league_id } = league;
        const existingWinnersForSeason = await datastore_1.default.weekWinners.findMany({ where: { league_id } });
        const weeksWithWinners = Array.from(new Set(existingWinnersForSeason.map(w => w.week)));
        const weeksToCheck = seasonWeeks.filter(w => !weeksWithWinners.includes(w));
        for (const week of weeksToCheck) {
            const winners = await getWinners({ league_id, season, week });
            if (winners && winners.length) {
                for (const winner of winners) {
                    for (const member of winner.member) {
                        await datastore_1.default.weekWinners.create({
                            data: {
                                league_id,
                                week,
                                membership_id: member.membership_id,
                                score_diff: winner.score_diff,
                                correct_count: winner.correct,
                            },
                        });
                    }
                }
            }
        }
    }
}
exports.markWinners = markWinners;
async function getWinners({ league_id, season, week, }) {
    const members = await datastore_1.default.leagueMember.findMany({
        where: { league_id },
    });
    const picks = await datastore_1.default.pick.findMany({
        where: {
            leaguemembers: { league_id },
            season,
            week,
        },
    });
    const games = await datastore_1.default.game.findMany({
        where: {
            season,
            week,
        },
    });
    const winners = await (0, winner_1.calculateWinnersFromDonePicks)(league_id, picks, games);
    return winners
        .filter(winner => winner.member_ids && winner.member_ids.length > 0)
        .map(winner => {
        return {
            member: members.filter(m => winner.member_ids?.includes(m.membership_id)),
            week: winner.week,
            correct: winner.num_correct || 0,
            score_diff: winner.score_diff || 0,
        };
    });
}
