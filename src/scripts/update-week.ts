import {datastore} from '@shared/datastore';
import {msf} from '@shared/dataproviders/mysportsfeeds';
import _ from 'lodash';
import moment from 'moment';

async function run() {
  const week = 15;
  const season = 2023;
  updateWeek({week, season});
  await Promise.all(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(async w => {
      updateWeek({week: w, season});
    })
  );
}

export async function updateWeek({week, season}: {week: number; season: number}) {
  const seasonGames = await msf.getGamesByWeek({season, week});
  const now = new Date();

  const games = seasonGames.filter(g => g.week === week);

  const dbGames = await datastore.game.findMany({
    where: {week, season},
    include: {
      teams_games_homeToteams: {select: {abbrev: true}},
      teams_games_awayToteams: {select: {abbrev: true}},
    },
  });

  await Promise.all(
    games.map(async g => {
      const dbGame = dbGames.find(
        db =>
          db.teams_games_awayToteams.abbrev === g.awayAbbrev &&
          db.teams_games_homeToteams.abbrev === g.homeAbbrev &&
          g.week === db.week
      );
      if (!dbGame) {
        return;
      }
      await datastore.game.update({
        where: {gid: dbGame.gid},
        data: {
          done: g.status === 'done',
          ts: g.startTime,
          seconds: +g.startTime,
        },
      });
    })
  );

  const allGamesAgain = await datastore.game.findMany({where: {season, week}});

  const sortedGames = _.sortBy(allGamesAgain, g => g.ts);

  const newLatestGame = sortedGames[sortedGames.length - 1];
  await datastore.game.updateMany({
    where: {
      week,
      season,
    },
    data: {
      is_tiebreaker: false,
    },
  });

  await datastore.game.update({
    where: {
      gid: newLatestGame.gid,
    },
    data: {
      is_tiebreaker: true,
    },
  });
}

run();
