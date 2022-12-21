"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateWinnersFromDonePicks = void 0;
const lodash_1 = __importDefault(require("lodash"));
async function calculateWinnersFromDonePicks(league_id, allPicks, allGames) {
    const weeks = [...new Set(allGames.map((g) => g.week))];
    const picksGroupedByWeek = allPicks.reduce((prev, curr) => {
        const { week } = curr;
        if (!(week in prev)) {
            prev[week] = [];
        }
        prev[week].push(curr);
        return prev;
    }, {});
    console.log(Object.keys(picksGroupedByWeek));
    const gamesGroupedByWeek = allGames.reduce((prev, curr) => {
        const { week } = curr;
        if (!(week in prev)) {
            prev[week] = [];
        }
        prev[week].push(curr);
        return prev;
    }, {});
    const gidToScore = allGames.reduce((prev, curr) => {
        prev[curr.gid] = (curr.homescore || 0) + (curr.awayscore || 0);
        return prev;
    }, {});
    const res = weeks.map((week) => {
        console.log(`hi it's week ${week}`);
        const weekPicks = picksGroupedByWeek[week] || [];
        const weekGames = gamesGroupedByWeek[week] || [];
        const season = weekGames[0].season;
        const anyNotDone = weekGames.some((p) => !p.done);
        console.log(`any not done? ${anyNotDone}`);
        if (anyNotDone) {
            return {
                league_id,
                week,
                season,
            };
        }
        const weekMemberIds = [...new Set(weekPicks.map((p) => p.member_id))];
        const memberToCorrectCount = weekPicks.reduce((prev, curr) => {
            const { member_id } = curr;
            if (!member_id) {
                return prev;
            }
            if (!(member_id in prev)) {
                prev[member_id] = 0;
            }
            if (week === 15 && member_id === 320) {
                console.log("member_id and curr", member_id, curr);
            }
            prev[member_id] = prev[member_id] + (curr.correct === 1 ? 1 : 0);
            return prev;
        }, {});
        if (week === 15) {
            console.log("week memberToCorrectCount", week, memberToCorrectCount);
        }
        const memberToScore = weekPicks.reduce((prev, curr) => {
            const { member_id } = curr;
            if (!member_id) {
                return prev;
            }
            if (curr.score && curr.score > 0) {
                prev[member_id] = curr.score;
            }
            return prev;
        }, {});
        const membersStats = weekMemberIds.map((member_id) => {
            return {
                member_id: member_id,
                correct: memberToCorrectCount[member_id] || 0,
                score_diff: memberToScore[member_id] || 999,
            };
        });
        lodash_1.default.orderBy(membersStats, ["score_diff", "correct"], ["desc", "asc"]);
        membersStats.sort((a, b) => {
            if (a.correct !== b.correct) {
                return a.correct - b.correct;
            }
            return a.score_diff - b.score_diff;
        });
        if (week === 15) {
            console.log("membersStats", membersStats);
        }
        const bestCorrect = membersStats.at(-1)?.correct || 0;
        const bestScore = membersStats.at(-1)?.score_diff || 0;
        const winners = membersStats.filter((stats) => stats.score_diff === bestScore && stats.correct === bestCorrect);
        return {
            league_id,
            week,
            season,
            member_ids: winners.map((winner) => winner.member_id),
            num_correct: bestCorrect,
            score: bestScore,
        };
    });
    return res;
}
exports.calculateWinnersFromDonePicks = calculateWinnersFromDonePicks;
