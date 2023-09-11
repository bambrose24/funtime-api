import datastore from '@shared/datastore';

async function run() {
  // await datastore.pick.updateMany({data: {done: 1}, where: {leaguemembers: {league_id: {lte: 7}}}});
  await datastore.league.updateMany({
    where: {league_id: {gte: 8}},
    data: {late_policy: 'allow_late_and_lock_after_start'},
  });
}

run();
