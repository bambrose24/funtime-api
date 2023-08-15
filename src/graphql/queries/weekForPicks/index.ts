import {Game, Pick} from '@prisma/client';
import datastore from '@shared/datastore';
import * as TypeGraphQL from '@generated/type-graphql';
import {Arg, Field, Int, ObjectType, Query} from 'type-graphql';
import {now} from '@util/time';
import {SEASON} from '@util/const';

@ObjectType()
class WeekForPicksResponse {
  @Field(() => Int, {nullable: true})
  week: number | null;
  @Field(() => Int, {nullable: true})
  season: number | null;
  @Field(() => [TypeGraphQL.Game]!)
  games: Array<Game>;
  @Field(() => [TypeGraphQL.Pick]!)
  existingPicks: Array<Pick>;
}

export class WeekForPicksResolver {
  @Query(() => WeekForPicksResponse)
  async weekForPicks(
    @Arg('leagueId', () => Int)
    league_id: number,
    @Arg('override', () => Boolean, {nullable: true})
    override?: boolean | null,
    @Arg('week', () => Int, {nullable: true})
    week?: number | null
  ): Promise<WeekForPicksResponse> {
    let weekRes: number;
    let season: number;
    if (week && override) {
      weekRes = week;
      season = SEASON;
    } else {
      const res = await findWeekForPicks({league_id});
      if (res === null) {
        return {week: null, season: null, games: [], existingPicks: []};
      }

      weekRes = res.week;
      season = res.season;
    }

    const [games, existingPicks] = await Promise.all([
      datastore.game.findMany({
        where: {week: weekRes, season},
      }),
      datastore.pick.findMany({where: {leaguemembers: {league_id}}}),
    ]);

    return {
      week: weekRes,
      season,
      games,
      existingPicks,
    };
  }
}

async function findWeekForPicks({
  league_id,
}: {
  league_id: number;
}): Promise<{
  week: number;
  season: number;
} | null> {
  const [gamesWithinMonth, league] = await Promise.all([
    datastore.game.findMany({
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
    }),
    datastore.league.findFirstOrThrow({where: {league_id}}),
  ]);

  switch (league.late_policy) {
    case 'allow_late_whole_week':
      return firstNotStartedGame(gamesWithinMonth);
    case 'close_at_first_game_start':
      return firstNotStartedWeek(gamesWithinMonth);
  }

  return null;
}

function firstNotStartedGame(gamesSorted: Array<Game>) {
  const now = new Date();
  for (const game of gamesSorted) {
    if (game.ts > now) {
      return {week: game.week, season: game.season};
    }
  }
  return null;
}

function firstNotStartedWeek(gamesSorted: Array<Game>) {
  const now = new Date();
  const startedWeekSeasons = new Set();
  for (const game of gamesSorted) {
    if (game.ts > now) {
      startedWeekSeasons.add(`${game.week},${game.season}`);
    }
  }
  for (const game of gamesSorted) {
    if (!startedWeekSeasons.has(`${game.week},${game.season}`)) {
      return {week: game.week, season: game.season};
    }
  }
  return null;
}
