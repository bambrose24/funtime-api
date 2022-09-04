/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Games } from "@prisma/client";
import datastore from "@shared/datastore";
import * as TypeGraphQL from "@generated/type-graphql";
import { Field, Int, ObjectType, Query } from "type-graphql";
import { now } from "@util/time";
import { PhoneNumberMock } from "graphql-scalars";

@ObjectType()
class FirstNotStartedWeekResponse {
  @Field(() => Int, { nullable: true })
  week: number | null;
  @Field(() => Int, { nullable: true })
  season: number | null;
  @Field(() => [TypeGraphQL.Games]!)
  games: Array<Games>;
}

class FirstNotStartedWeekResolver {
  @Query(() => FirstNotStartedWeekResponse)
  async firstNotStartedWeek(): Promise<FirstNotStartedWeekResponse> {
    const res = await findWeekForPicks();
    if (res === null) {
      return { week: null, season: null, games: [] };
    }

    const { week, season } = res;

    const games = await datastore.games.findMany({ where: { week, season } });

    return {
      week,
      season,
      games,
    };
  }
}

async function findWeekForPicks(): Promise<{
  week: number;
  season: number;
} | null> {
  const gamesWithinMonth = await datastore.games.findMany({
    where: {
      ts: {
        gte: now().subtract({ months: 1 }).toDate(),
        lte: now().add({ months: 1 }).toDate(),
      },
    },
    orderBy: { ts: "asc" },
  });

  const startedWeeks = new Set<string>();

  gamesWithinMonth.forEach((game) => {
    if (game.ts < now().toDate()) {
      startedWeeks.add(`${game.week},${game.season}`);
    }
  });
  console.log("startedWeeks", startedWeeks);

  for (let i = 0; i < gamesWithinMonth.length; i++) {
    const { week, season } = gamesWithinMonth[i];
    if (!startedWeeks.has(`${week},${season}`)) {
      return { week, season };
    }
  }
  return null;
}

export default FirstNotStartedWeekResolver;
