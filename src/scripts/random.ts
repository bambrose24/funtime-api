import 'reflect-metadata';
import {LEAGUE_ID} from '@graphql/mutations/register';
import {datastore} from '@shared/datastore';
import {getGamesByWeek_DEPRECATED} from '@shared/mysportsfeeds/old';
import {logger} from '@util/logger';
import _ from 'lodash';
import {msf} from '@shared/mysportsfeeds';

async function run() {
  try {
    console.log('starting script');

    const games = await msf.getGamesBySeason({season: 2023});
    console.log('games??', games.length);

    console.log('ending script');
  } catch (e) {
    console.error('error', e);
  }
}

run();
