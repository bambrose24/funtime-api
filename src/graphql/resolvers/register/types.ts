import { LeagueMembers, People } from "@prisma/client";
import { User } from "src/generated/graphql";

export type MutationRegisterArgs = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  previousUserId: number;
};

export type RegisterResponse = {
  success: boolean;
  user: People;
  membership: LeagueMembers;
};
