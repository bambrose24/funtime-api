/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Games, Picks, Prisma } from "@prisma/client";
import datastore from "@shared/datastore";
import moment from "moment";
import * as TypeGraphQL from "@generated/type-graphql";
import { Arg, Field, Int, ObjectType, Query } from "type-graphql";

@ObjectType()
class MostRecentStartedWeekResponse {
  @Field(() => Int, { nullable: true })
  week: number;
  @Field(() => Int, { nullable: true })
  season: number;
  @Field(() => [TypeGraphQL.Picks]!)
  picks: Array<Picks>;
  @Field(() => [TypeGraphQL.Games]!)
  games: Array<Games>;
}

class MostRecentStartedWeekResolver {
  @Query(() => MostRecentStartedWeekResponse)
  async mostRecentStartedWeek(
    @Arg("leagueId", () => Int)
    league_id: number
  ): Promise<MostRecentStartedWeekResponse> {
    const mostRecentStartedGame = await datastore.games.findFirst({
      where: {
        ts: { lte: moment().toDate() },
      },
      orderBy: { ts: "desc" },
    });

    if (!mostRecentStartedGame) {
      throw new Error("No games have ts before right now");
    }

    const { week, season } = mostRecentStartedGame;

    const [games, picks] = await Promise.all([
      datastore.games.findMany({ where: { week, season } }),
      datastore.picks.findMany({
        where: { week, LeagueMembers: { league_id } },
      }),
    ]);

    return {
      week,
      season,
      picks,
      games,
    };
  }
}

export default MostRecentStartedWeekResolver;
