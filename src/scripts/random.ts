import {MessageType} from '@prisma/client';
import datastore from '@shared/datastore';
import {getGamesByWeek} from '@shared/mysportsfeeds';
import {logger} from '@util/logger';
import _ from 'lodash';

async function run() {
  console.log('starting script');
  console.log('ending script');
}

run();
