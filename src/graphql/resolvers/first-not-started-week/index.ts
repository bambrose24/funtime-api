/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Games, Picks, Prisma } from "@prisma/client";
import datastore from "@shared/datastore";
import moment from "moment";
import * as TypeGraphQL from "@generated/type-graphql";
import { Arg, Field, Int, ObjectType, Query } from "type-graphql";

@ObjectType()
class FirstNotStartedWeekResponse {
  @Field(() => Int, { nullable: true })
  week: number;
  @Field(() => Int, { nullable: true })
  season: number;
  @Field(() => [TypeGraphQL.Games]!)
  games: Array<Games>;
}

class FirstNotStartedWeekResolver {
  @Query(() => FirstNotStartedWeekResponse)
  async firstNotStartedWeek(): Promise<FirstNotStartedWeekResponse> {
    const mostRecentStartedGame = await datastore.games.findFirst({
      where: {
        ts: { gte: moment().toDate() },
      },
      orderBy: { ts: "asc" },
    });

    if (!mostRecentStartedGame) {
      throw new Error("No games have ts before right now");
    }

    const { week, season } = mostRecentStartedGame;

    const games = await datastore.games.findMany({ where: { week, season } });

    return {
      week,
      season,
      games,
    };
  }
}

export default FirstNotStartedWeekResolver;
