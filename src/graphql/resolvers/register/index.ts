import datastore from "../../../../src/datastore";
import { People } from "@prisma/client";
import { MutationRegisterArgs, RegisterResponse } from "./types";

export const SEASON = 2022;
export const LEAGUE_ID = 7;
export const DEFAULT_ROLE = "player";

export async function register(
  parent: undefined,
  input: MutationRegisterArgs,
  context: undefined
): Promise<RegisterResponse> {
  const { firstName, lastName, email, username, previousUserId } = input;
  let user: People | null = null;
  if (previousUserId) {
    user = await datastore.people.findUnique({
      where: { uid: previousUserId },
    });
    if (!user) {
      throw new Error(`Could not find a user with ID ${previousUserId}`);
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
