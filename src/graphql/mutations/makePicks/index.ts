import datastore from '@shared/datastore';
import {LeagueMember, User} from '@prisma/client';
import {Arg, Field, InputType, Int, Mutation, ObjectType, Resolver} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {sendPickSuccessEmail} from '@shared/email';
import {getUser} from '@shared/auth/user';

@ObjectType()
class MakePicksResponse {
  @Field()
  success: boolean;
  @Field(() => TypeGraphQL.User)
  user: User;
}

@InputType()
class GamePick {
  @Field(() => Int)
  game_id: number;
  @Field(() => Int)
  winner: number;
  @Field()
  is_random: boolean;
  @Field(() => Int, {nullable: true})
  score?: number;
}

@Resolver()
class MakePicksResolver {
  @Mutation(() => MakePicksResponse)
  async makePicks(
    @Arg('league_id', () => Int) league_id: number,
    @Arg('picks', () => [GamePick]) picks: GamePick[],
    @Arg('override_member_id', () => Int, {nullable: true})
    override_member_id: number
  ): Promise<MakePicksResponse> {
    const auth = getUser();
    if (!auth || !auth.dbUser) {
      throw new Error('Need a user to make picks');
    }
    const dbUser = auth.dbUser;

    const member = override_member_id
      ? await datastore.leagueMember.findFirstOrThrow({where: {membership_id: override_member_id}})
      : await datastore.leagueMember.findFirstOrThrow({
          where: {league_id, people: {uid: dbUser.uid}},
        });
    if (picks.length === 0) {
      return {success: false, user: dbUser};
    }

    const startedGamesForWeek = await datastore.game.findMany({
      where: {
        gid: {in: picks.map(p => p.game_id)},
        ts: {
          lt: new Date(),
        },
      },
    });
    const startedGids = new Set(startedGamesForWeek.map(g => g.gid));
    const filteredPicks = picks.filter(p => !startedGids.has(p.game_id));

    const {week, season} = await upsertWeekPicksForMember(member.membership_id, filteredPicks);

    try {
      const adminUsername = override_member_id ? dbUser.username : undefined;
      console.log('adminUsername in picks mutation', adminUsername);
      await sendPickSuccessEmail(member.membership_id, week, season, adminUsername);
    } catch (e) {
      console.error('email error', e);
    }

    return {success: true, user: dbUser};
  }
}

async function upsertWeekPicksForMember(
  member_id: number,
  picks: Array<GamePick>
): Promise<{week: number; season: number}> {
  const user = await datastore.leagueMember
    .findUniqueOrThrow({where: {membership_id: member_id}})
    .people();

  if (!user) {
    throw new Error('Could not make picks for unknown member');
  }

  const games = await datastore.game.findMany({
    where: {gid: {in: picks.map(g => g.game_id)}},
  });

  // check if they're all the same week
  const submissionWeeksAndSeasons = games.reduce(
    (acc, curr) => acc.add(`${curr.week},${curr.season}`),
    new Set<string>()
  );
  if (submissionWeeksAndSeasons.size > 1) {
    throw new Error('Multiple weeks were submitted at the same time');
  }
  const week = games[0].week;
  const season = games[0].season;

  // TODO check if the person is able to make picks for the week based on game start time

  // TODO let picks happen until the "majority" time

  const existingPick = await datastore.pick.findFirst({
    where: {member_id: {equals: member_id}},
  });

  if (existingPick) {
    await datastore.pick.deleteMany({
      where: {
        member_id: {equals: member_id},
        week: {equals: week},
        season: {equals: season},
      },
    });
  }

  await datastore.pick.createMany({
    data: picks.map(({game_id, winner, score, is_random}) => {
      const game = games.find(g => g.gid === game_id)!;
      const loserId = game.away === winner ? game.home : game?.away;
      return {
        uid: user.uid,
        member_id,
        week,
        season,
        gid: game_id,
        winner,
        loser: loserId,
        score,
        is_random,
      };
    }),
  });

  return {
    week,
    season,
  };
}

export default MakePicksResolver;
