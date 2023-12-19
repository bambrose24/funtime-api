import {MessageType} from '@prisma/client';
import datastore from '@shared/datastore';
import {getGamesByWeek} from '@shared/mysportsfeeds';
import {logger} from '@util/logger';
import _ from 'lodash';

async function run() {
  console.log('starting script');

  const notDone2022 = await datastore.game.findMany({where: {done: false, season: 2022}});
  console.log('notDone?', notDone2022.length);

  console.log('ending script');
}

run();
