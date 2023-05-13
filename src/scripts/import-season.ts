/* eslint-disable @typescript-eslint/no-unsafe-argument */
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  require('dotenv').config();
}
import {Game, Team} from '@prisma/client';
import datastore from '@shared/datastore';
import {getGamesBySeason} from '@shared/mysportsfeeds';
import {SEASON} from '@util/const';

async function run() {
  const games = await getGamesBySeason(SEASON);
  const teams = await datastore.team.findMany({
    where: {teamid: {gte: 0}},
  });
  const teamsMap: Record<string, Team> = {};
  teams.forEach(t => {
    teamsMap[t.abbrev!] = t;
  });

  const dbGames = games.map((g: any) => convertToDBGameForCreation(SEASON, g, teamsMap));
  // const res = await datastore.games.createMany({ data: dbGames });
}

function convertToDBGameForCreation(
  season: number,
  game: any,
  teamsMap: Record<string, Team>
): Pick<
  Game,
  | 'home'
  | 'homescore'
  | 'away'
  | 'awayscore'
  | 'season'
  | 'week'
  | 'ts'
  | 'seconds'
  | 'done'
  | 'winner'
> {
  return {
    home: teamsMap[game.homeTeam.abbreviation].teamid,
    homescore: 0,
    away: teamsMap[game.awayTeam.abbreviation].teamid,
    awayscore: 0,
    season,
    week: game.week,
    ts: new Date(game.startTime),
    seconds: new Date(game.startTime).getTime() / 1000,
    done: false,
    winner: null,
  };
}

run();
