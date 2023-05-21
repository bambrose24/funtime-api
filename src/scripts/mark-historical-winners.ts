import {markWinners} from '@cron/markWinners';

async function run() {
  for (let i = 2014; i <= 2023; i++) {
    await markWinners(i);
  }
}

run();
