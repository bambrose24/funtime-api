import { Game, Team } from "@prisma/client";
import datastore from "@shared/datastore";
import { MSFGame, MSFGamePlayedStatus } from "@shared/mysportsfeeds/types";
import _ from "lodash";
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

  const gamesChunked = _.chunk(dbGames, 5);
  for (let dbGamesChunk of gamesChunked) {
    dbGamesChunk.forEach(async (dbGame) => {
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
          `[cron] could not find msf game for ${awayTeam.abbrev}@${homeTeam.abbrev}`
        );
      }

      const homeScore = msfGame?.score.homeScoreTotal!;
      const awayScore = msfGame?.score.awayScoreTotal!;

      await datastore.game.update({
        where: { gid: dbGame.gid },
        data: {
          homescore:
            homeScore === null || homeScore === undefined ? 0 : homeScore,
          awayscore:
            awayScore === null || awayScore === undefined ? 0 : awayScore,
        },
      });

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

        const gameUpdateData = {
          done: true,
          winner,
          homescore: homeScore,
          awayscore: awayScore,
          ...(msfGame?.schedule.startTime
            ? { ts: moment(msfGame.schedule.startTime).toDate() }
            : {}),
        };

        await datastore.game.update({
          where: { gid: dbGame.gid },
          data: gameUpdateData,
        });

        console.info(`[cron] updating picks for ${dbGame.gid}`);
        const correctPickIds: number[] = [];
        const wrongPickIds: number[] = [];
        picks.forEach(async (p) => {
          let correct = false;
          if (winner === null || p.winner === winner) {
            correct = true;
            correctPickIds.push(p.pickid);
          } else {
            wrongPickIds.push(p.pickid);
          }
        });
        await datastore.pick.updateMany({
          where: { pickid: { in: correctPickIds } },
          data: { correct: 1 },
        });
        await datastore.pick.updateMany({
          where: { pickid: { in: wrongPickIds } },
          data: { correct: 0 },
        });
      }

      const awayrecord = getRecord(dbGames, dbGame, dbGame.away);
      const homerecord = getRecord(dbGames, dbGame, dbGame.home);

      await datastore.game.update({
        where: { gid: dbGame.gid },
        data: {
          homerecord,
          awayrecord,
        },
      });
    });
  }
}

function getRecord(
  dbGames: Array<Game>,
  currGame: Game,
  teamId: number
): string {
  const prevDoneGamesWithTeam = dbGames.filter(
    (g) =>
      (g.home === teamId || g.away === teamId) &&
      g.week < currGame.week &&
      g.done
  );
  const wins = prevDoneGamesWithTeam.filter((g) => g.winner === teamId).length;
  const losses = prevDoneGamesWithTeam.filter(
    (g) => g.winner && g.winner !== teamId
  ).length;
  const ties = prevDoneGamesWithTeam.filter((g) => !g.winner).length;

  if (ties) {
    return `${wins}-${losses}-${ties}`;
  }
  return `${wins}-${losses}`;
}
