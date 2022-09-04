/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Games, Picks } from "@prisma/client";
import datastore from "@shared/datastore";
import * as TypeGraphQL from "@generated/type-graphql";
import { Arg, Field, Int, ObjectType, Query } from "type-graphql";
import { now } from "@util/time";
import moment from "moment";

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
    @Arg("league_id", () => Int)
    league_id: number
  ): Promise<MostRecentStartedWeekResponse> {
    const mostRecentStartedGame = await datastore.games.findFirst({
      where: {
        ts: { lte: now().toDate() },
      },
      orderBy: { ts: "desc" },
    });

    console.log(mostRecentStartedGame, now(), moment());

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
