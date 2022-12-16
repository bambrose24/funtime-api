import { Game, Pick } from "@prisma/client";
import _ from "lodash";

type Winner = {
  league_id: number;
  week: number;
  season: number;
  member_ids?: Array<number> | undefined;
  num_correct?: number | undefined;
  score?: number | undefined;
};

export async function calculateWinnerFromDonePicks(
  league_id: number,
  allPicks: Array<Pick>,
  allGames: Array<Game>
): Promise<Array<Winner>> {
  const weeks = [...new Set(allGames.map((g) => g.week))];

  const picksGroupedByWeek = _.groupBy(allPicks, "week");
  const gamesGroupedByWeek = _.groupBy(allGames, "week");
  const gidToScore = allGames.reduce((prev, curr) => {
    prev[curr.gid] = (curr.homescore || 0) + (curr.awayscore || 0);
    return prev;
  }, {} as Record<number, number>);

  return await Promise.all(
    weeks.map(async (week) => {
      const weekPicks = picksGroupedByWeek[week];
      const weekGames = gamesGroupedByWeek[week];
      const season = weekGames[0].season;
      const anyNotDone = weekPicks.some((p) => !p.done);
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
        prev[member_id] = prev[member_id] + (curr.correct ? 1 : 0);
        return prev;
      }, {} as Record<number, number>);

      const memberToScore = weekPicks.reduce((prev, curr) => {
        const { member_id } = curr;
        if (!member_id) {
          return prev;
        }
        if (curr.score && curr.score > 0) {
          prev[member_id] = curr.score;
        }
        return prev;
      }, {} as Record<number, number>);

      const membersStats = weekMemberIds.map((member_id) => {
        return {
          member_id: member_id!,
          correct: memberToScore[member_id!],
          score: memberToScore[member_id!],
        };
      });

      membersStats.sort((a, b) => {
        if (a.correct !== b.correct) {
          return a.correct - b.correct;
        }
        return a.score - b.score;
      });

      const bestCorrect = membersStats[0].correct;
      const bestScore = membersStats[0].score;

      const winners = membersStats.filter(
        (stats) => stats.score === bestScore && stats.correct === bestCorrect
      );

      return {
        league_id,
        week,
        season,
        member_ids: winners.map((winner) => winner.member_id),
        num_correct: bestCorrect,
        score: bestScore,
      };
    })
  );
}
