/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {Game} from '@prisma/client';
import datastore from '@shared/datastore';
import * as TypeGraphQL from '@generated/type-graphql';
import {Arg, Field, Int, ObjectType, Query} from 'type-graphql';
import {now} from '@util/time';
import {PhoneNumberMock} from 'graphql-scalars';
import {SEASON} from '@util/const';

@ObjectType()
class FirstNotFinishedWeekResponse {
  @Field(() => Int, {nullable: true})
  week: number | null;
  @Field(() => Int, {nullable: true})
  season: number | null;
  @Field(() => [TypeGraphQL.Game]!)
  games: Array<Game>;
}

export class FirstNotFinishedWeekResolver {
  @Query(() => FirstNotFinishedWeekResponse)
  async firstNotFinishedWeek(
    @Arg('override', () => Boolean, {nullable: true})
    override?: boolean | null,
    @Arg('week', () => Int, {nullable: true})
    week?: number | null
  ): Promise<FirstNotFinishedWeekResponse> {
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

  for (const game of gamesWithinMonth) {
    if (game.ts > now().toDate()) {
      return {week: game.week, season: game.season};
    }
  }

  return null;
}
