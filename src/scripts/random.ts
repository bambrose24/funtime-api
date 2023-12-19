import {MessageType} from '@prisma/client';
import datastore from '@shared/datastore';
import {getGamesByWeek} from '@shared/mysportsfeeds';
import {logger} from '@util/logger';
import _ from 'lodash';

async function run() {
  console.log('starting script');

  await datastore.weekWinners.deleteMany({where: {week: 15, league_id: 8}});

  console.log('ending script');
}

run();
