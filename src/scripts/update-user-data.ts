import datastore from '@shared/datastore';

async function run() {
  const members = await datastore.leagueMember.findMany({where: {league_id: 8}});
  const memberIds = members.map(m => m.membership_id);
  const users = await datastore.user.findMany({
    where: {leaguemembers: {some: {membership_id: {in: memberIds}}}},
  });

  await datastore.leagueMember.update({where: {membership_id: 382}, data: {role: 'admin'}});
}

run();
