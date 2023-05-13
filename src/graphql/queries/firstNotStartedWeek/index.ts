/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {Game} from '@prisma/client';
import datastore from '@shared/datastore';
import * as TypeGraphQL from '@generated/type-graphql';
import {Arg, Field, Int, ObjectType, Query} from 'type-graphql';
import {now} from '@util/time';
import {PhoneNumberMock} from 'graphql-scalars';
import {SEASON} from '@util/const';

@ObjectType()
class FirstNotStartedWeekResponse {
  @Field(() => Int, {nullable: true})
  week: number | null;
  @Field(() => Int, {nullable: true})
  season: number | null;
  @Field(() => [TypeGraphQL.Game]!)
  games: Array<Game>;
}

class FirstNotStartedWeekResolver {
  @Query(() => FirstNotStartedWeekResponse)
  async firstNotStartedWeek(
    @Arg('override', () => Boolean, {nullable: true})
    override?: boolean | null,
    @Arg('week', () => Int, {nullable: true})
    week?: number | null
  ): Promise<FirstNotStartedWeekResponse> {
    let weekRes: number;
    let season: number;
    if (week && override) {
      weekRes = week;
      season = SEASON;
    } else {
      const res = await findWeekForPicks();
      if (res === null) {
        return {week: null, season: null, games: []};
      }

      weekRes = res.week;
      season = res.season;
    }

    const games = await datastore.game.findMany({
      where: {week: weekRes, season},
    });

    return {
      week: weekRes,
      season,
      games,
    };
  }
}

async function findWeekForPicks(): Promise<{
  week: number;
  season: number;
} | null> {
  const gamesWithinMonth = await datastore.game.findMany({
    where: {
      ts: {
        gte: now()
          .subtract({months: 1})
          .toDate(),
        lte: now()
          .add({months: 1})
          .toDate(),
      },
    },
    orderBy: {ts: 'asc'},
  });

  const startedWeeks = new Set<string>();

  gamesWithinMonth.forEach(game => {
    if (game.ts < now().toDate()) {
      startedWeeks.add(`${game.week},${game.season}`);
    }
  });

  for (let i = 0; i < gamesWithinMonth.length; i++) {
    const {week, season} = gamesWithinMonth[i];
    if (!startedWeeks.has(`${week},${season}`)) {
      return {week, season};
    }
  }
  return null;
}

export default FirstNotStartedWeekResolver;
