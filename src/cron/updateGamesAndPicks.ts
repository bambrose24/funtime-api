import { Team } from "@prisma/client";
import datastore from "@shared/datastore";
import { MSFGame, MSFGamePlayedStatus } from "@shared/mysportsfeeds/types";
import moment from "moment";
import { SEASON } from "../graphql/resolvers/register";

export default async function updateGamesAndPicks(games: Array<MSFGame>) {
  const [dbGames, teams] = await Promise.all([
    datastore.game.findMany({
      where: {
        season: { equals: SEASON },
        week: { in: games.map((g) => g.schedule.week) },
      },
    }),
    datastore.team.findMany({ where: { teamid: { gt: 0 } } }),
  ]);
  const teamsMap = teams.reduce((prev, curr) => {
    prev[curr.teamid] = curr;
    return prev;
  }, {} as Record<number, Team>);

  await dbGames.forEach(async (dbGame) => {
    // TODO put this back when winner is set properly below for every "done" game
    // if (dbGame.done) {
    //   return;
    // }
    const homeTeam = teamsMap[dbGame.home];
    const awayTeam = teamsMap[dbGame.away];
    const msfGame = games.find(
      (g) =>
        g.schedule.homeTeam.abbreviation === homeTeam.abbrev &&
        g.schedule.awayTeam.abbreviation === awayTeam.abbrev
    );
    if (!msfGame) {
      console.log(
        `could not find msf game for ${awayTeam.abbrev}@${homeTeam.abbrev}`
      );
    }

    const homeScore = msfGame?.score.homeScoreTotal!;
    const awayScore = msfGame?.score.awayScoreTotal!;

    if (
      msfGame?.schedule.playedStatus === MSFGamePlayedStatus.COMPLETED &&
      homeScore !== null &&
      awayScore !== null
    ) {
      const winner =
        homeScore === awayScore
          ? null
          : homeScore > awayScore
          ? dbGame.home
          : dbGame.away;
      // game is done, time to update picks and dbGame.done = true
      const picks = await datastore.pick.findMany({
        where: { gid: dbGame.gid },
      });
      console.info(`[cron] setting game ${dbGame.gid} to done`);
      await datastore.game.update({
        data: {
          done: true,
          winner,
        },
        where: {
          gid: dbGame.gid,
        },
      });
      console.info(`[cron] updating picks for ${dbGame.gid}`);
      await picks.forEach(async (p) => {
        let correct = false;
        if (winner === null || p.winner === winner) {
          correct = true;
        }
        console.info(`[cron] setting pick ${p.pickid} as correct ${correct}`);
        await datastore.pick.update({
          where: { pickid: p.pickid },
          data: { correct: correct ? 1 : 0 },
        });
      });
    }

    if (homeScore !== null && awayScore !== null) {
      const data: Parameters<typeof datastore.game.update>[number]["data"] = {
        homescore: homeScore,
        awayscore: awayScore,
      };
      if (msfGame?.schedule.startTime) {
        data["ts"] = moment(msfGame.schedule.startTime).toDate();
      }
      console.info(
        `[cron] setting ${dbGame.gid} to data ${JSON.stringify(data)}`
      );
      await datastore.game.update({
        where: { gid: dbGame.gid },
        data,
      });
    }
  });
}
