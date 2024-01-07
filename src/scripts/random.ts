import 'reflect-metadata';
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
