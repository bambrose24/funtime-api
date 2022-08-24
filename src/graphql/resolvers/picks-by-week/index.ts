/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Games, Picks, Prisma } from "@prisma/client";
import datastore from "@shared/datastore";
import moment from "moment";
import * as TypeGraphQL from "@generated/type-graphql";
import { Arg, Field, Int, ObjectType, Query } from "type-graphql";

@ObjectType()
class PicksByWeekResponse {
  @Field(() => Int, { nullable: true })
  week: number;
  @Field(() => Int, { nullable: true })
  season: number;
  @Field()
  canView: boolean;
  @Field(() => [TypeGraphQL.Picks]!)
  picks: Array<Picks>;
  @Field(() => [TypeGraphQL.Games]!)
  games: Array<Games>;
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
    const league = await datastore.leagues.findFirst({
      where: { league_id: { equals: league_id } },
    });

    const season = league?.season as number;

    if (!season) {
      throw new Error(`could not find season from league_id ${league_id}`);
    }

    let games: Array<Games> | undefined;
    const whereInput: Prisma.GamesWhereInput = {};
    if (week) {
      whereInput["week"] = { equals: week };
      whereInput["season"] = { equals: season };

      games = await datastore.games.findMany({
        where: {
          week: { equals: week },
          season: { equals: season },
        },
        orderBy: { ts: "asc" },
      });
    } else {
      const lastStartedGame = await datastore.games.findFirst({
        where: {
          ts: { lte: moment().toDate() },
          season: { equals: season },
        },
        orderBy: { ts: "asc" },
      });
      if (!lastStartedGame) {
        games = [];
      } else {
        games = await datastore.games.findMany({
          where: {
            week: { equals: lastStartedGame.week },
            season: { equals: lastStartedGame.season },
          },
          orderBy: { ts: "asc" },
        });
      }
    }

    if (!games || games.length === 0) {
      return {
        week,
        season,
        canView: override || false,
        picks: [],
        games: [],
      };
    }

    const { week: realWeek, season: realSeason } = games[0];

    const canView = games[0].ts < moment().toDate();

    const picks = await datastore.picks.findMany({
      where: {
        week: { equals: realWeek },
        season: { equals: realSeason },
        LeagueMembers: {
          league_id: { equals: league_id },
        },
      },
    });

    return {
      week: realWeek,
      season: realSeason,
      canView: override || canView,
      picks,
      games,
    };
  }
}

export default PicksByWeekResolver;
