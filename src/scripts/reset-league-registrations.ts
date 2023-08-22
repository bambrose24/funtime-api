import datastore from '@shared/datastore';

async function run() {
  const leagueIdToReset = 8;
  const league = await datastore.league.findFirstOrThrow({where: {league_id: leagueIdToReset}});

  /**
   * TODO:
   * 1. Delete SuperBowl picks for league memebers
   * 2. Delete Picks for league members
   * 3. Delete league members
   */

  // TEST
  // const allLeagues = await datastore.league.findMany({});
  // console.log(
  //   'leagues?',
  //   allLeagues.map(l => l.name)
  // );

  const leagueMembers = await datastore.leagueMember.findMany({
    where: {league_id: league.league_id},
  });
  const memberIds = leagueMembers.map(m => m.membership_id);

  // delete superbowl picks
  await datastore.superbowl.deleteMany({
    where: {leaguemembers: {membership_id: {in: memberIds}}},
  });

  // delete picks
  await datastore.pick.deleteMany({
    where: {leaguemembers: {membership_id: {in: memberIds}}},
  });

  // finally delete league members
  await datastore.leagueMember.deleteMany({where: {league_id: league.league_id}});
}

run();
