import 'reflect-metadata';
import {LEAGUE_ID} from '@graphql/mutations/register';
import {datastore} from '@shared/datastore';
import {getGamesByWeek} from '@shared/mysportsfeeds';
import {logger} from '@util/logger';
import _ from 'lodash';

async function run() {
  try {
    console.log('starting script');

    console.log('ending script');
  } catch (e) {
    console.error('error', e);
  }
}

run();
