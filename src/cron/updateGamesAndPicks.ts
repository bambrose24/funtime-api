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

  dbGames.forEach(async (dbGame) => {
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

      const prevHomeGame = dbGames.find(
        (g) =>
          g.week === dbGame.week - 1 &&
          (g.home === dbGame.home || g.away === dbGame.home)
      );

      const prevAwayGame = dbGames.find(
        (g) =>
          g.week === dbGame.week - 1 &&
          (g.home === dbGame.home || g.away === dbGame.home)
      );

      const prevHomeRecord =
        (dbGame.home === prevHomeGame?.home
          ? prevHomeGame?.homerecord
          : prevHomeGame?.awayrecord) || "0-0";
      const prevAwayRecord =
        (dbGame.away === prevAwayGame?.home
          ? prevAwayGame?.homerecord
          : prevAwayGame?.awayrecord) || "0-0";

      const awayRecord = getNewRecord(prevAwayRecord, dbGame.away, winner);
      const homeRecord = getNewRecord(prevHomeRecord, dbGame.home, winner);

      console.log(
        `[cron] setting awayRecord to ${awayRecord} from ${prevAwayRecord} (winner ${winner}, game.away ${dbGame.away}, game.gid ${dbGame.gid})`
      );

      const gameUpdateData = {
        done: true,
        winner,
        homescore: homeScore,
        awayscore: awayScore,
      };

      console.info(
        `[cron] updating game ${dbGame.gid} to ${JSON.stringify(
          gameUpdateData
        )}`
      );

      await Promise.all([
        datastore.game.update({
          data: gameUpdateData,
          where: {
            gid: dbGame.gid,
          },
        }),
        // change the future home team's record to the current home team's new record (if exists)
        datastore.game.updateMany({
          data: { homerecord: homeRecord },
          where: {
            week: dbGame.week + 1,
            season: dbGame.season,
            home: dbGame.home,
          },
        }),
        // change the future away team's record to the current home team's new record (if exists)
        datastore.game.updateMany({
          data: { awayrecord: homeRecord },
          where: {
            week: dbGame.week + 1,
            season: dbGame.season,
            away: dbGame.home,
          },
        }),
        // change the future home team's record to the current away team's new record (if exists)
        datastore.game.updateMany({
          data: { homerecord: awayRecord },
          where: {
            week: dbGame.week + 1,
            season: dbGame.season,
            home: dbGame.away,
          },
        }),
        // change the future away team's record to the current away team's new record (if exists)
        datastore.game.updateMany({
          data: { awayrecord: awayRecord },
          where: {
            week: dbGame.week + 1,
            season: dbGame.season,
            away: dbGame.away,
          },
        }),
      ]);

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

function getNewRecord(
  prevRecord: string,
  team: number,
  winner: number | null
): string {
  const split = prevRecord.split("-");
  if (split.length === 2) {
    const [wins, losses] = split;
    if (winner === null) {
      return `${wins}-${losses}-1`;
    }
    if (team === winner) {
      return `${parseInt(wins) + 1}-${losses}`;
    }
    return `${wins}-${parseInt(losses) + 1}`;
  } else {
    const [wins, losses, ties] = split;
    if (winner === null) {
      return `${wins}-${losses}-${parseInt(ties) + 1}`;
    } else if (team === winner) {
      return `${parseInt(wins) + 1}-${losses}-${ties}`;
    } else {
      return `${wins}-${parseInt(losses) + 1}-${ties}`;
    }
  }
}
