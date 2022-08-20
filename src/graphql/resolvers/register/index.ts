import datastore from "@shared/datastore";
import { LeagueMembers, People } from "@prisma/client";
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
  @Field(() => TypeGraphQL.People)
  user: People;
  @Field(() => TypeGraphQL.LeagueMembers)
  membership: LeagueMembers;
}

@Resolver()
class RegisterResolver {
  @Mutation(() => RegisterResponse)
  async register(
    @Arg("email") email: string,
    @Arg("username") username: string,
    @Arg("previousUserId", () => Int, { nullable: true })
    previousUserId: number | null
  ): Promise<RegisterResponse> {
    const { user, membership } = await upsertUserAndMembership(
      email,
      username,
      previousUserId
    );

    try {
      await sendRegistrationMail(username, email, SEASON);
    } catch (e) {
      console.log("email error:", e);
    }

    return { success: true, user, membership };
  }
}

async function upsertUserAndMembership(
  email: string,
  username: string,
  previousUserId: number | null
): Promise<{ user: People; membership: LeagueMembers }> {
  let user: People | null = null;
  let membership: LeagueMembers | null = null;

  // see if user already exists for this season
  user = await datastore.people.findFirst({
    where: { email: email, season: { gte: 2021 } },
  });

  if (user) {
    membership = await datastore.leagueMembers.findFirst({
      where: { user_id: user.uid, league_id: LEAGUE_ID },
    });
    if (membership) {
      return { user, membership };
    }
  }
  if (previousUserId) {
    user = await datastore.people.findUnique({
      where: { uid: previousUserId },
    });
    if (!user) {
      throw new Error(
        `Could not find a user with previous ID ${previousUserId}`
      );
    }
  } else {
    user = await datastore.people.findFirst({
      where: {
        email,
        season: 2021,
      },
    });
    if (!user) {
      user = await datastore.people.create({
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

  membership = await datastore.leagueMembers.create({
    data: {
      league_id: LEAGUE_ID,
      user_id: user.uid,
      role: DEFAULT_ROLE,
    },
  });

  return { user, membership };
}

export default RegisterResolver;
