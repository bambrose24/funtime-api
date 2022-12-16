import { Arg, Field, Int, ObjectType, Query } from "type-graphql";
import * as TypeGraphQL from "@generated/type-graphql";
import { LeagueMember } from "@prisma/client";
import datastore from "@shared/datastore";

@ObjectType()
class WeekWinner {
  @Field(() => TypeGraphQL.LeagueMember)
  user: LeagueMember | null;
  @Field(() => Int)
  week: number;
}

@ObjectType()
class WeekWinnersResponse {
  @Field(() => [WeekWinner])
  winners: Array<WeekWinner>;
}

@ObjectType()
class WeekWinnersRequest {
  @Field(() => Boolean, { nullable: true })
  league_id?: boolean | null;
  @Field(() => Int, { nullable: true })
  week?: number | null;
}

class FirstNotStartedWeekResolver {
  @Query(() => WeekWinnersResponse)
  async weekWinners(
    @Arg("league_id", () => Int)
    league_id: number,
    @Arg("season", () => Int, { nullable: true })
    season?: number | null,
    @Arg("weeks", () => [Int], { nullable: true })
    weeks?: Array<number> | null
  ): Promise<WeekWinnersResponse> {
    const people = await datastore.leagueMember.findMany({
      where: { league_id },
    });
    const picks = await datastore.pick.findMany({
      where: {
        leaguemembers: { league_id },
        ...(weeks ? { week: { in: weeks } } : {}),
        ...(season ? { season } : {}),
      },
    });
  }
}
