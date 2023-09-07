import datastore from '@shared/datastore';

async function run() {
  const leagueId = 8;

  const members = await datastore.leagueMember.findMany({where: {league_id: leagueId}});

  const picksForMembers = await datastore.pick.findMany({
    where: {member_id: {in: members.map(m => m.membership_id)}},
  });

  const pickedMembers = new Set(picksForMembers.map(p => p.member_id));

  const nonPickedMembers = members.filter(m => {
    if (pickedMembers.has(m.membership_id)) {
      return false;
    }
    return true;
  });

  const people = await datastore.user.findMany({
    where: {
      leaguemembers: {some: {membership_id: {in: nonPickedMembers.map(m => m.membership_id)}}},
    },
    select: {
      username: true,
      email: true,
    },
  });

  console.log(
    people.map(p => {
      return p;
    })
  );
}

run();
