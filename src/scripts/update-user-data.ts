import {datastore} from '@shared/datastore';

async function run() {
  // const members = await datastore.leagueMember.findMany({where: {league_id: 8}});
  // const memberIds = members.map(m => m.membership_id);
  // const users = await datastore.user.findMany({
  //   where: {leaguemembers: {some: {membership_id: {in: memberIds}}}},
  // });
  // erica 2023 member update
  // await datastore.leagueMember.update({where: {membership_id: 386}, data: {role: 'admin'}});
  // delete user 332 - erica vertical email
  // await datastore.user.delete({where: {uid: 332}});
  // user 313 needs email eambrose@verticalsystems.com
  // await datastore.user.update({where: {uid: 313}, data: {email: 'eambrose@verticalsystems.com'}});
  // make membership_id 433 admin (erica0ambrose on 2023 league)
  // await datastore.leagueMember.update({where: {membership_id: 433}, data: {role: 'admin'}});
}

run();
