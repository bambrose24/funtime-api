import * as React from 'react';

import {sendWeekReminderEmail} from '../../src/shared/email';
import {datastore} from '../shared/datastore';

async function run() {
  const games = await datastore.game.findMany({
    where: {season: 2023, week: 1},
    orderBy: {ts: 'asc'},
  });
  const game = games[0]!;
  const response = await sendWeekReminderEmail({
    leagueName: 'League Name',
    leagueId: 8,
    email: 'bambrose24@gmail.com',
    username: 'Bobby A.',
    week: 1,
    weekStartTime: game.ts,
  });
  console.log('response?', response);
}

run();
