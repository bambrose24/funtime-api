import {datastore} from '@shared/datastore';
import {MemberRole, MessageType, User} from '@prisma/client';
import {Arg, Field, InputType, Int, Mutation, ObjectType, Resolver} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {sendPickSuccessEmail} from '@shared/email';
import {getUser} from '@shared/auth/user';
import {PRISMA_CACHES} from '@util/const';

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
    override_member_id: number,
    @Arg('message', () => String, {nullable: true})
    message: string | null
  ): Promise<MakePicksResponse> {
    const auth = getUser();
    if (!auth || !auth.dbUser) {
      throw new Error('Need a user to make picks');
    }
    const dbUser = auth.dbUser;

    const viewerMember = await datastore.leagueMember.findFirstOrThrow({
      where: {league_id, people: {uid: dbUser.uid}},
      // cacheStrategy PRISMA_CACHES.oneDay,
    });
    if (
      override_member_id &&
      override_member_id !== viewerMember.membership_id &&
      viewerMember.role !== MemberRole.admin
    ) {
      throw new Error(
        `You cannot make picks for someone if you are not an admin (viewer uid ${dbUser?.uid} league_id ${league_id} override_member_id ${override_member_id})`
      );
    }

    const isImpersonating = Boolean(override_member_id);

    const member = override_member_id
      ? await datastore.leagueMember.findFirstOrThrow({
          where: {membership_id: override_member_id},
          // cacheStrategy PRISMA_CACHES.oneDay,
        })
      : viewerMember;
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
    const filteredPicks = isImpersonating ? picks : picks.filter(p => !startedGids.has(p.game_id));

    const {week, season} = await upsertWeekPicksForMember(
      member.membership_id,
      filteredPicks,
      isImpersonating
    );

    if (message) {
      await datastore.leagueMessage.create({
        data: {
          message_type: MessageType.WEEK_COMMENT,
          content: message,
          league_id,
          member_id: member.membership_id,
          week,
        },
      });
    }

    try {
      const adminUsername = isImpersonating ? dbUser.username : undefined;
      await sendPickSuccessEmail(member.membership_id, week, season, adminUsername);
    } catch (e) {
      console.error('email error', e);
    }

    return {success: true, user: dbUser};
  }
}

async function upsertWeekPicksForMember(
  member_id: number,
  picks: Array<GamePick>,
  isImpersonating: boolean
): Promise<{week: number; season: number}> {
  const user = await datastore.user.findFirstOrThrow({
    where: {leaguemembers: {some: {membership_id: member_id}}},
  });

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

  const existingPick = await datastore.pick.findFirst({
    where: {
      member_id,
      week,
      season,
    },
  });

  if (existingPick) {
    await datastore.pick.deleteMany({
      where: {
        member_id,
        week,
        season,
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
