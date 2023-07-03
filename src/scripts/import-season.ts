/* eslint-disable @typescript-eslint/no-unsafe-argument */
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  require('dotenv').config();
}
import {Game, Team} from '@prisma/client';
import datastore from '@shared/datastore';
import {getGamesBySeason} from '@shared/mysportsfeeds';
import {MSFGame} from '@shared/mysportsfeeds/types';
import {SEASON} from '@util/const';
import _ from 'lodash';

async function run() {
  const games = await getGamesBySeason(SEASON);
  const teams = await datastore.team.findMany({
    where: {teamid: {gte: 0}},
  });
  const teamsMap: Record<string, Team> = {};
  teams.forEach(t => {
    teamsMap[t.abbrev!] = t;
  });

  const dbGames = games.map((g: MSFGame) => convertToDBGameForCreation(SEASON, g, teamsMap));
  console.log(`prepped ${dbGames.length} games to input`);
  const res = await datastore.game.createMany({data: dbGames});
  console.log(`created ${res.count} games for ${SEASON}`);

  const newGames = await datastore.game.findMany({where: {season: SEASON}});

  const weeks = new Set(newGames.map(g => g.week));
  for (const week of [...weeks]) {
    let maxGame: Game;
    const weekGames = newGames.filter(g => g.week === week);
    const maxGameTs = _.maxBy(weekGames, 'ts');
    if (!maxGameTs) {
      throw new Error(`Could not figure out the max game ts for week ${week}`);
    }
    const otherGames = weekGames.filter(g => g.ts.getTime() === maxGameTs.ts.getTime());
    if (otherGames.length > 1) {
      maxGame = _.maxBy(otherGames, 'msf_id')!;
    } else {
      maxGame = maxGameTs;
    }
    await datastore.game.update({where: {gid: maxGame.gid}, data: {is_tiebreaker: true}});
  }
}

function convertToDBGameForCreation(
  season: number,
  game: MSFGame,
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
  | 'msf_id'
> {
  return {
    home: teamsMap[game.schedule.homeTeam.abbreviation].teamid,
    homescore: 0,
    away: teamsMap[game.schedule.awayTeam.abbreviation].teamid,
    awayscore: 0,
    season,
    week: game.schedule.week,
    ts: new Date(game.schedule.startTime),
    seconds: new Date(game.schedule.startTime).getTime() / 1000,
    done: false,
    winner: null,
    msf_id: game.schedule.id,
  };
}

run();
