import datastore from '@shared/datastore';

async function run() {
  // const members = await datastore.leagueMember.findMany({where: {league_id: 8}});
  // const memberIds = members.map(m => m.membership_id);
  // const users = await datastore.user.findMany({
  //   where: {leaguemembers: {some: {membership_id: {in: memberIds}}}},
  // });
  // erica 2023 member update
  // await datastore.leagueMember.update({where: {membership_id: 386}, data: {role: 'admin'}});
}

run();
