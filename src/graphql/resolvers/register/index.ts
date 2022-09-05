import datastore from "@shared/datastore";
import { LeagueMember, User } from "@prisma/client";
import { Arg, Field, Int, Mutation, ObjectType, Resolver } from "type-graphql";
import * as TypeGraphQL from "@generated/type-graphql";
import { sendRegistrationMail } from "@shared/email";
export const SEASON = 2022;
export const LEAGUE_ID = 7;
export const DEFAULT_ROLE = "player";

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
    @Arg("email") email: string,
    @Arg("username") username: string,
    @Arg("previousUserId", () => Int, { nullable: true })
    previousUserId: number | null,
    @Arg("superbowlWinner", () => Int) superbowlWinner: number,
    @Arg("superbowlLoser", () => Int) superbowlLoser: number,
    @Arg("superbowlScore", () => Int) superbowlScore: number
  ): Promise<RegisterResponse> {
    const { user, membership } = await registerUser(
      email,
      username,
      previousUserId
    );

    await upsertSuperbowlPick(
      user,
      membership,
      superbowlWinner,
      superbowlLoser,
      superbowlScore
    );

    try {
      await sendRegistrationMail(
        username,
        email,
        SEASON,
        superbowlWinner,
        superbowlLoser,
        superbowlScore
      );
    } catch (e) {
      console.log("email error:", e);
    }

    return { success: true, user, membership };
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
      member_id: { equals: membership.membership_id },
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

async function registerUser(
  email: string,
  username: string,
  previousUserId: number | null
): Promise<{ user: User; membership: LeagueMember }> {
  let user: User | null = null;
  let membership: LeagueMember | null = null;

  // see if user already exists for this season
  user = await datastore.user.findFirst({
    where: { email: email, season: { gte: 2021 } },
  });

  if (user) {
    membership = await datastore.leagueMember.findFirst({
      where: { user_id: user.uid, league_id: LEAGUE_ID },
    });
    if (membership) {
      return { user, membership };
    }
  }
  if (previousUserId) {
    user = await datastore.user.findUnique({
      where: { uid: previousUserId },
    });
    if (!user) {
      throw new Error(
        `Could not find a user with previous ID ${previousUserId}`
      );
    }
  } else {
    user = await datastore.user.findFirst({
      where: {
        email,
        season: 2021,
      },
    });
    if (!user) {
      user = await datastore.user.create({
        data: {
          username,
          email,
          season: 2022,
          fname: "",
          lname: "",
        },
      });
    }
    if (!user) {
      throw new Error(`Error creating a new user`);
    }
  }

  membership = await datastore.leagueMember.create({
    data: {
      league_id: LEAGUE_ID,
      user_id: user.uid,
      role: DEFAULT_ROLE,
    },
  });

  return { user, membership };
}

export default RegisterResolver;
