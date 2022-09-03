import { Teams } from "@prisma/client";
import datastore from "@shared/datastore";
import { MSFGame, MSFGamePlayedStatus } from "@shared/mysportsfeeds/types";
import moment from "moment";
import { SEASON } from "src/graphql/resolvers/register";

export default async function updateGamesAndPicks(games: Array<MSFGame>) {
  const [dbGames, teams] = await Promise.all([
    datastore.games.findMany({
      where: {
        season: { equals: SEASON },
        week: { in: games.map((g) => g.schedule.week) },
      },
    }),
    datastore.teams.findMany({ where: { teamid: { gt: 0 } } }),
  ]);
  const teamsMap = teams.reduce((prev, curr) => {
    prev[curr.teamid] = curr;
    return prev;
  }, {} as Record<number, Teams>);

  dbGames.forEach(async (dbGame) => {
    if (dbGame.done) {
      return;
    }
    const homeTeam = teamsMap[dbGame.home];
    const awayTeam = teamsMap[dbGame.away];
    const msfGame = games.find(
      (g) =>
        g.schedule.homeTeam.abbreviation === homeTeam.abbrev &&
        g.schedule.awayTeam.abbreviation === awayTeam.abbrev
    );
    if (!msfGame) {
      console.log("could not find");
    }

    const homeScore = msfGame?.score.homeScoreTotal!;
    const awayScore = msfGame?.score.awayScoreTotal!;

    if (
      msfGame?.schedule.playedStatus === MSFGamePlayedStatus.COMPLETED &&
      homeScore !== null &&
      awayScore !== null
    ) {
      // game is done, time to update picks and dbGame.done = true
      const picks = await datastore.picks.findMany({
        where: { gid: dbGame.gid },
      });
      await datastore.games.update({
        data: {
          done: true,
        },
        where: {
          gid: dbGame.gid,
        },
      });
      await picks.forEach(async (p) => {
        let correct = false;
        if (
          homeScore === awayScore ||
          (homeScore > awayScore && p.winner === homeTeam.teamid) ||
          (awayScore > homeScore && p.winner == awayTeam.teamid)
        ) {
          correct = true;
        }
        await datastore.picks.update({
          where: { pickid: p.pickid },
          data: { correct: correct ? 1 : 0 },
        });
      });
    }

    if (homeScore !== null && awayScore !== null) {
      const data: Parameters<typeof datastore.games.update>[number]["data"] = {
        homescore: homeScore,
        awayscore: awayScore,
      };
      if (msfGame?.schedule.startTime) {
        data["ts"] = moment(msfGame.schedule.startTime).toDate();
      }
      console.info(
        `[cron] setting ${dbGame.gid} to data ${JSON.stringify(data)}`
      );
      await datastore.games.update({
        where: { gid: dbGame.gid },
        data,
      });
    }
  });

  // TODO adjust homescore and awayscore and ts for each game based on MSF result
  // if playedStatus === COMPLETE then mark the game done
}
