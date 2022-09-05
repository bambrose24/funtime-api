/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Game, Pick, Prisma } from "@prisma/client";
import datastore from "@shared/datastore";
import moment from "moment";
import * as TypeGraphQL from "@generated/type-graphql";
import { Arg, Field, Int, ObjectType, Query } from "type-graphql";
import { now } from "@util/time";

@ObjectType()
class PicksByWeekResponse {
  @Field(() => Int, { nullable: true })
  week: number;
  @Field(() => Int, { nullable: true })
  season: number;
  @Field()
  canView: boolean;
  @Field(() => [TypeGraphQL.Pick]!)
  picks: Array<Pick>;
  @Field(() => [TypeGraphQL.Game]!)
  games: Array<Game>;
}

class PicksByWeekResolver {
  @Query(() => PicksByWeekResponse)
  async picksByWeek(
    @Arg("leagueId", () => Int)
    league_id: number,
    @Arg("week", () => Int, { nullable: true })
    week: number,
    @Arg("override", { nullable: true })
    override: boolean
  ): Promise<PicksByWeekResponse> {
    console.log("getting picks by week...");
    return { week, season: 2022, picks: [], games: [], canView: true };
    // const league = await datastore.league.findFirst({
    //   where: { league_id: { equals: league_id } },
    // });

    // const season = league?.season as number;

    // if (!season) {
    //   throw new Error(`could not find season from league_id ${league_id}`);
    // }

    // let games: Array<Game> | undefined;
    // const whereInput: Prisma.GameWhereInput = {};
    // if (week) {
    //   whereInput["week"] = { equals: week };
    //   whereInput["season"] = { equals: season };

    //   games = await datastore.game.findMany({
    //     where: {
    //       week: { equals: week },
    //       season: { equals: season },
    //     },
    //     orderBy: { ts: "asc" },
    //   });
    // } else {
    //   const lastStartedGame = await datastore.game.findFirst({
    //     where: {
    //       ts: { lte: now().toDate() },
    //       season: { equals: season },
    //     },
    //     orderBy: { ts: "asc" },
    //   });
    //   if (!lastStartedGame) {
    //     games = [];
    //   } else {
    //     games = await datastore.game.findMany({
    //       where: {
    //         week: { equals: lastStartedGame.week },
    //         season: { equals: lastStartedGame.season },
    //       },
    //       orderBy: { ts: "asc" },
    //     });
    //   }
    // }

    // if (!games || games.length === 0) {
    //   return {
    //     week,
    //     season,
    //     canView: override || false,
    //     picks: [],
    //     games: [],
    //   };
    // }

    // const { week: realWeek, season: realSeason } = games[0];

    // const canView = games[0].ts < moment().toDate();

    // const picks = await datastore.pick.findMany({
    //   where: {
    //     week: { equals: realWeek },
    //     season: { equals: realSeason },
    //     leaguemembers: {
    //       league_id: { equals: league_id },
    //     },
    //   },
    // });

    // return {
    //   week: realWeek,
    //   season: realSeason,
    //   canView: override || canView,
    //   picks,
    //   games,
    // };
  }
}

export default PicksByWeekResolver;
