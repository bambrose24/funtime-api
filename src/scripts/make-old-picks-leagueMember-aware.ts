import datastore from '@shared/datastore';
import {logger} from '@util/logger';

async function run() {
  const picksWithoutMember = await datastore.pick.findMany({});
  const [people, members, leagues] = await Promise.all([
    datastore.user.findMany({}),
    datastore.leagueMember.findMany({}),
    datastore.league.findMany({}),
  ]);

  const pickUpdates = [];
  const solvedMembershipIds = new Set<number>();

  for (let i = 0; i < picksWithoutMember.length; i++) {
    logger.info(`updating pick ${i} of ${picksWithoutMember.length}`);

    const pick = picksWithoutMember[i];

    const league = leagues.find(l => l.season === pick.season)!;
    const member = members.find(m => m.league_id === league.league_id && m.user_id === pick.uid);

    if (!member) {
      continue;
    }

    if (pick.member_id !== member.membership_id) {
      logger.info(
        `  [doing real update pickid ${pick.pickid} to member_id ${member.membership_id} from ${pick.member_id}]`
      );

      await datastore.pick.update({
        where: {pickid: pick.pickid},
        data: {member_id: member.membership_id},
      });
    } else {
      logger.info(`  [skipping update for pickid ${pick.pickid} because already equal members]`);
    }

    solvedMembershipIds.add(member.membership_id);
  }
}

run();
