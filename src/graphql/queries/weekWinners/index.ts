import {Arg, Field, Int, ObjectType, Query} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {League, LeagueMember} from '@prisma/client';
import datastore from '@shared/datastore';
import {calculateWinnersFromDonePicks} from '@shared/winner';

@ObjectType()
class WeekWinner {
  @Field(() => [TypeGraphQL.LeagueMember])
  member: Array<LeagueMember> | null;
  @Field(() => Int)
  week: number;
  @Field(() => Int)
  correct: number;
  @Field(() => Int)
  score_diff: number;
}

class WeekWinnersResolver {
  @Query(() => [WeekWinner])
  async weekWinners(
    @Arg('league_id', () => Int)
    league_id: number,
    @Arg('season', () => Int, {nullable: true})
    season?: number | null,
    @Arg('weeks', () => [Int], {nullable: true})
    weeks?: Array<number> | null
  ): Promise<Array<WeekWinner>> {
    const members = await datastore.leagueMember.findMany({
      where: {league_id},
    });
    const picks = await datastore.pick.findMany({
      where: {
        leaguemembers: {league_id},
        ...(weeks ? {week: {in: weeks}} : {}),
        ...(season ? {season} : {}),
      },
    });
    const league = await datastore.league.findUnique({where: {league_id}});
    const games = await datastore.game.findMany({
      where: {
        ...(season ? {season} : league && league.season ? {season: league.season} : {}),
        ...(weeks ? {week: {in: weeks}} : {}),
      },
    });

    const winners = await calculateWinnersFromDonePicks(league_id, picks, games);

    return winners
      .filter(winner => winner.member_ids && winner.member_ids.length > 0)
      .map(winner => {
        return {
          member: members.filter(m => winner.member_ids?.includes(m.membership_id)),
          week: winner.week,
          correct: winner.num_correct || 0,
          score_diff: winner.score_diff || 0,
        };
      });
  }
}

export default WeekWinnersResolver;
