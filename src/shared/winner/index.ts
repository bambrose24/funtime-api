import { Game, Pick } from "@prisma/client";
import _ from "lodash";

type Winner = {
  league_id: number;
  week: number;
  season: number;
  member_ids?: Array<number> | undefined;
  num_correct?: number | undefined;
  score_diff?: number | undefined;
};

export async function calculateWinnersFromDonePicks(
  leagueId: number,
  allPicks: Array<Pick>,
  allGames: Array<Game>
): Promise<Array<Winner>> {
  const weeks = [...new Set(allGames.map((g) => g.week))];

  const picksGroupedByWeek = allPicks.reduce((prev, curr) => {
    const { week } = curr;
    if (!(week in prev)) {
      prev[week] = [];
    }
    prev[week].push(curr);
    return prev;
  }, {} as Record<number, Array<Pick>>);

  const gamesGroupedByWeek = allGames.reduce((prev, curr) => {
    const { week } = curr;
    if (!(week in prev)) {
      prev[week] = [];
    }
    prev[week].push(curr);
    return prev;
  }, {} as Record<number, Array<Game>>);

  const gidToScore = allGames.reduce((prev, curr) => {
    prev[curr.gid] = (curr.homescore || 0) + (curr.awayscore || 0);
    return prev;
  }, {} as Record<number, number>);

  return weeks.map((week) => {
    const weekPicks = picksGroupedByWeek[week] || [];
    const weekGames = gamesGroupedByWeek[week] || [];
    const season = weekGames[0].season;
    const anyNotDone = weekGames.some((p) => !p.done);
    if (anyNotDone) {
      return {
        league_id: leagueId,
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
      prev[member_id] = prev[member_id] + (curr.correct === 1 ? 1 : 0);
      return prev;
    }, {} as Record<number, number>);

    const memberToScore = weekPicks.reduce((prev, curr) => {
      const { member_id } = curr;
      if (!member_id) {
        return prev;
      }
      if (curr.score && curr.score > 0) {
        const gameScore = gidToScore[curr.gid] || 0;
        prev[member_id] = Math.abs(curr.score - gameScore);
      }
      return prev;
    }, {} as Record<number, number>);

    let membersStats = weekMemberIds.map((member_id) => {
      return {
        member_id: member_id!,
        correct: memberToCorrectCount[member_id!] || 0,
        score_diff: memberToScore[member_id!] || 999,
      };
    });

    membersStats = _.orderBy(
      membersStats,
      ["correct", "score_diff"],
      ["asc", "desc"]
    );

    const bestCorrect = membersStats.at(-1)?.correct || 0;
    const bestScore = membersStats.at(-1)?.score_diff || 0;

    const winners = membersStats.filter(
      (stats) => stats.score_diff === bestScore && stats.correct === bestCorrect
    );

    return {
      league_id: leagueId,
      week,
      season,
      member_ids: winners.map((winner) => winner.member_id),
      num_correct: bestCorrect,
      score: bestScore,
    };
  });
}
