/* eslint-disable @typescript-eslint/no-unsafe-argument */
if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  require("dotenv").config();
}
import { Games, Teams } from "@prisma/client";
import { AnyKindOfDictionary } from "lodash";
import datastore from "@shared/datastore";
import { getGamesBySeason } from "@shared/mysportsfeeds";

async function run() {
  const season = 2022;
  const games = await getGamesBySeason(season);
  const teams = await datastore.teams.findMany({
    where: { teamid: { gte: 0 } },
  });
  const teamsMap: Record<string, Teams> = {};
  teams.forEach((t) => {
    teamsMap[t.abbrev!] = t;
  });

  const dbGames = games.map((g: any) =>
    convertToDBGameForCreation(season, g, teamsMap)
  );
  // const res = await datastore.games.createMany({ data: dbGames });
}

function convertToDBGameForCreation(
  season: number,
  game: any,
  teamsMap: Record<string, Teams>
): Pick<
  Games,
  | "home"
  | "homescore"
  | "away"
  | "awayscore"
  | "season"
  | "week"
  | "ts"
  | "seconds"
  | "done"
  | "winner"
> {
  return {
    home: teamsMap[game.homeTeam.abbreviation].teamid,
    homescore: 0,
    away: teamsMap[game.awayTeam.abbreviation].teamid,
    awayscore: 0,
    season,
    week: game.week,
    ts: new Date(game.startTime),
    seconds: BigInt(new Date(game.startTime).getTime() / 1000),
    done: false,
    winner: null,
  };
}

run();
