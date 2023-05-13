import datastore from '@shared/datastore';

async function run() {
  const picksWithoutMember = await datastore.pick.findMany({where: {member_id: {equals: null}}});
  const [people, members, leagues] = await Promise.all([
    datastore.user.findMany({}),
    datastore.leagueMember.findMany({}),
    datastore.league.findMany({}),
  ]);

  const pickUpdates = [];
  const solvedUids = new Set<number>();

  for (let i = 0; i < picksWithoutMember.length; i++) {
    console.log(`updating pick ${i} of ${picksWithoutMember.length}`);

    const pick = picksWithoutMember[i];
    if (solvedUids.has(pick.uid)) {
      continue;
    }
    const league = leagues.find(l => l.season === pick.season)!;
    const member = members.find(m => m.league_id === league.league_id && m.user_id === pick.uid);

    if (!member) {
      continue;
    }

    await datastore.pick.updateMany({
      where: {uid: {equals: pick.uid}},
      data: {member_id: member.membership_id},
    });
    solvedUids.add(pick.uid);
  }
}

run();
