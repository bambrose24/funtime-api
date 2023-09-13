/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {Game, Pick} from '@prisma/client';
import datastore from '@shared/datastore';
import * as TypeGraphQL from '@generated/type-graphql';
import {Arg, Field, Int, ObjectType, Query} from 'type-graphql';
import {now} from '@util/time';
import moment from 'moment';
import {logger} from '@util/logger';

@ObjectType()
class MostRecentStartedWeekResponse {
  @Field(() => Int, {nullable: true})
  week: number;
  @Field(() => Int, {nullable: true})
  season: number;
  @Field(() => [TypeGraphQL.Pick]!)
  picks: Array<Pick>;
  @Field(() => [TypeGraphQL.Game]!)
  games: Array<Game>;
}

class MostRecentStartedWeekResolver {
  @Query(() => MostRecentStartedWeekResponse)
  async mostRecentStartedWeek(
    @Arg('league_id', () => Int)
    league_id: number
  ): Promise<MostRecentStartedWeekResponse> {
    const mostRecentStartedGame = await datastore.game.findFirst({
      where: {
        ts: {lte: now().toDate()},
      },
      orderBy: {ts: 'desc'},
    });

    if (!mostRecentStartedGame) {
      throw new Error('No games have ts before right now');
    }

    const {week, season} = mostRecentStartedGame;

    const [games, picks] = await Promise.all([
      datastore.game.findMany({where: {week, season}}),
      datastore.pick.findMany({
        where: {week, leaguemembers: {league_id}},
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
