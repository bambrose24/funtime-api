import { Game, Team } from "@prisma/client";
import { datastore } from "@shared/datastore";
import { MSFGame, MSFGamePlayedStatus } from "@shared/dataproviders/mysportsfeeds/types";
import { DEFAULT_SEASON } from "@util/const";
import { logger } from "@util/logger";
import _ from "lodash";
import moment from "moment";
import { DataProviderGame } from "@shared/dataproviders/types";

export default async function updateGamesAndPicks(games: Array<DataProviderGame>) {
  const [dbGames, teams] = await Promise.all([
    datastore.game.findMany({
      where: {
        season: { equals: DEFAULT_SEASON },
        week: { in: games.map((g) => g.week) },
      },
    }),
    datastore.team.findMany({ where: { teamid: { gt: 0 } } }),
  ]);
  const teamsMap = teams.reduce((prev, curr) => {
    prev[curr.teamid] = curr;
    return prev;
  }, {} as Record<number, Team>);

  const gamesChunked = _.chunk(dbGames, 3);
  for (let dbGamesChunk of gamesChunked) {
    await Promise.all(
      dbGamesChunk.map(async (dbGame) => {
        if (dbGame.ts < moment().subtract(30, 'days').toDate()) {
          // if it's been 30 days don't bother wasting resources trying to update
          return;
        }
        const homeTeam = teamsMap[dbGame.home];
        const awayTeam = teamsMap[dbGame.away];
        const providerGame = games.find(
          (g) =>
            g.homeAbbrev === homeTeam.abbrev &&
            g.awayAbbrev === awayTeam.abbrev
             && g.week === dbGame.week
        );
        if (!providerGame) {
          logger.info(
            `[cron] could not find msf game for ${awayTeam.abbrev}@${homeTeam.abbrev}`
          );
        }

        const homeScore = providerGame?.homeScore;
        const awayScore = providerGame?.awayScore;

        logger.info(`[cron] Data Provider Game in update for ${dbGame.gid}`, providerGame)

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
          providerGame?.status === 'done' &&
          homeScore !== null && 
          homeScore !== undefined &&
          awayScore !== null && 
          awayScore !== undefined
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
          logger.info(`[cron] setting game ${dbGame.gid} to done`);

          const gameUpdateData = {
            done: true,
            winner,
            homescore: homeScore,
            awayscore: awayScore,
            ...(providerGame?.startTime
              ? { ts: moment(providerGame.startTime).toDate() }
              : {}),
          } satisfies Parameters<typeof datastore["game"]["update"]>[0]["data"];

          const correctPickIds: number[] = [];
          const wrongPickIds: number[] = [];
          picks.forEach((p) => {
            if (p.winner && (winner === null || p.winner === winner)) {
              correctPickIds.push(p.pickid);
            } else {
              wrongPickIds.push(p.pickid);
            }
          });

          logger.info(
            `[cron] updating picks for ${dbGame.gid} - setting ${correctPickIds.length} to correct and ${wrongPickIds.length} to wrong`
          );

          await datastore.game.update({
            where: { gid: dbGame.gid },
            data: gameUpdateData,
          });
          await datastore.pick.updateMany({
            where: { pickid: { in: correctPickIds } },
            data: { correct: 1, done: 1 },
          });
          await datastore.pick.updateMany({
            where: { pickid: { in: wrongPickIds } },
            data: { correct: 0, done: 1 },
          });
        }

        const awayrecord = getRecord(dbGames, dbGame, dbGame.away);
        const homerecord = getRecord(dbGames, dbGame, dbGame.home);

        await datastore.game.update({
          where: { gid: dbGame.gid },
          data: {
            homerecord,
            awayrecord,
            ...(providerGame?.startTime
              ? { ts: providerGame?.startTime }
              : {}),
          },
        });
      })
    );
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
