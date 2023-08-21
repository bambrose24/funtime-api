import datastore from '@shared/datastore';
import {LeagueMember, User} from '@prisma/client';
import {Arg, Field, Int, Mutation, ObjectType, Resolver} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {sendRegistrationMail} from '@shared/email';
import {SEASON} from '@util/const';
import {getUser} from '@shared/auth/user';
export const LEAGUE_ID = 7;
export const DEFAULT_ROLE = 'player';

@ObjectType()
class RegisterResponse {
  @Field()
  success: boolean;
  @Field(() => TypeGraphQL.User)
  user: User;
  @Field(() => TypeGraphQL.LeagueMember)
  membership: LeagueMember;
}

@Resolver()
class RegisterResolver {
  @Mutation(() => RegisterResponse)
  async register(
    @Arg('leagueCode') leagueCode: string,
    @Arg('username') username: string,
    @Arg('superbowlWinner', () => Int) superbowlWinner: number,
    @Arg('superbowlLoser', () => Int) superbowlLoser: number,
    @Arg('superbowlScore', () => Int) superbowlScore: number
  ): Promise<RegisterResponse> {
    const league = await datastore.league.findFirstOrThrow({where: {share_code: leagueCode}});
    const {dbUser: authDbUser, supabase} = getUser() ?? {};
    if (!supabase || !supabase.email) {
      throw new Error('Cannot register without being logged in');
    }
    let user = authDbUser;
    if (!user) {
      user = await datastore.user.create({
        data: {
          email: supabase.email,
          username,
          fname: '',
          lname: '',
          season: league.season,
        },
      });
    }

    const existingMembership = await datastore.leagueMember.findFirst({
      where: {user_id: user.uid, league_id: league.league_id},
    });
    if (existingMembership) {
      throw new Error('Cannot register twice for the same league');
    }
    const membership = await datastore.leagueMember.create({
      data: {
        league_id: league.league_id,
        user_id: user.uid,
        role: 'player',
      },
    });
    await datastore.superbowl.create({
      data: {
        member_id: membership.membership_id,
        winner: superbowlWinner,
        loser: superbowlLoser,
        score: superbowlScore,
        uid: user.uid,
      },
    });

    await upsertSuperbowlPick(user, membership, superbowlWinner, superbowlLoser, superbowlScore);

    try {
      await sendRegistrationMail(user, league, superbowlWinner, superbowlLoser, superbowlScore);
    } catch (e) {
      console.log('email error:', e);
    }

    return {success: true, user, membership};
  }
}

async function upsertSuperbowlPick(
  user: User,
  membership: LeagueMember,
  superbowlWinner: number,
  superbowlLoser: number,
  superbowlScore: number
): Promise<void> {
  const currentSuperbowlPick = await datastore.superbowl.findFirst({
    where: {
      member_id: {equals: membership.membership_id},
    },
  });

  if (currentSuperbowlPick) {
    await datastore.superbowl.update({
      where: {
        pickid: currentSuperbowlPick.pickid,
      },
      data: {
        uid: user.uid,
        winner: superbowlWinner,
        loser: superbowlLoser,
        score: superbowlScore,
        member_id: membership.membership_id,
      },
    });
    return;
  }

  await datastore.superbowl.create({
    data: {
      uid: user.uid,
      winner: superbowlWinner,
      loser: superbowlLoser,
      score: superbowlScore,
      member_id: membership.membership_id,
    },
  });
}

export default RegisterResolver;
