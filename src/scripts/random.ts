import 'reflect-metadata';
import {LEAGUE_ID} from '@graphql/mutations/register';
import {MessageType} from '@prisma/client';
import datastore from '@shared/datastore';
import {getGamesByWeek} from '@shared/mysportsfeeds';
import {logger} from '@util/logger';
import _ from 'lodash';

async function run() {
  console.log('starting script');

  // const notDone2022 = await datastore.game.findMany({where: {done: false, season: 2022}});
  // console.log('notDone?', notDone2022.length);

  const week = 19;
  const season = 2023;
  const games = await datastore.game.findMany({where: {week, season}});

  console.log(
    games.map(g => {
      const {gid, done, winner} = g;
      return {gid, done, winner};
    })
  );

  await datastore.game.updateMany({where: {week, season}, data: {done: false, winner: null}});

  await datastore.pick.updateMany({
    where: {
      week,
      leaguemembers: {
        league_id: LEAGUE_ID,
      },
    },
    data: {
      correct: 0,
      done: 0,
    },
  });

  console.log('ending script');
}

run();
