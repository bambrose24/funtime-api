import datastore from "../../../../src/datastore";
import { LeagueMembers, People } from "@prisma/client";
import { Arg, Field, Mutation, ObjectType, Resolver } from "type-graphql";
import * as TypeGraphQL from "@generated/type-graphql";
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
    @Arg("firstName") firstName: string,
    @Arg("lastName") lastName: string,
    @Arg("email") email: string,
    @Arg("username") username: string,
    @Arg("previousUserId", { nullable: true }) previousUserId: number
  ): Promise<RegisterResponse> {
    let user: People | null = null;
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
            fname: firstName,
            lname: lastName,
            username,
            email,
            season: 2022,
          },
        });
      }
      if (!user) {
        throw new Error(`Error creating a new user`);
      }
    }

    const membership = await datastore.leagueMembers.create({
      data: {
        league_id: LEAGUE_ID,
        user_id: user.uid,
        role: DEFAULT_ROLE,
      },
    });

    if (!membership) {
      throw new Error(`Error making league membership`);
    }

    return { success: true, user, membership };
  }
}

export default RegisterResolver;
