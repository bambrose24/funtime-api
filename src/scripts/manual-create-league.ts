import datastore from '@shared/datastore';
import {SEASON} from '@util/const';
import {logger} from '@util/logger';
import {nanoid} from 'nanoid';

async function run() {
  const bob = await datastore.user.findFirstOrThrow({where: {email: 'bambrose24@gmail.com'}});
  const now = new Date();

  const shareCode = nanoid();

  const league = await datastore.league.create({
    data: {
      name: 'Funtime 2023',
      season: SEASON,
      share_code: shareCode,
      created_by_user_id: bob.uid,
      superbowl_competition: true,
      created_time: now,
      late_policy: 'allow_late_whole_week',
      pick_policy: 'choose_winner',
      reminder_policy: 'three_hours_before',
      scoring_type: 'game_winner',
    },
  });

  const membership = await datastore.leagueMember.create({
    data: {
      league_id: league.league_id,
      user_id: bob.uid,
      role: 'admin',
      ts: now,
    },
  });

  logger.info(`created league ${league.league_id} with membership ${membership.membership_id}`);
}

run();
