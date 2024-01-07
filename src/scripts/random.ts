import 'reflect-metadata';
import _ from 'lodash';
import {provider} from '@shared/dataproviders';

async function run() {
  try {
    console.log('starting script');

    const games = await provider.getGamesBySeason({season: 2023});
    console.log('games??', games.length);

    console.log('ending script');
  } catch (e) {
    console.error('error', e);
  }
}

run();
