import {MessageType} from '@prisma/client';
import datastore from '@shared/datastore';
import {getGamesByWeek} from '@shared/mysportsfeeds';
import {logger} from '@util/logger';

async function run() {
  // await datastore.pick.updateMany({data: {done: 1}, where: {leaguemembers: {league_id: {lte: 7}}}});
  // await datastore.leagueMessage.create({
  //   data: {
  //     message_type: MessageType.WEEK_COMMENT,
  //     week: 2,
  //     content:
  //       "A new feature! Going forward, you can add comments to your picks to talk smack, make a joke, or anything you like. They're public to the league!",
  //     league_id: 8,
  //     member_id: 382,
  //   },
  // });
  const games = await getGamesByWeek(2023, 2);
  console.log(games);
}

run();
