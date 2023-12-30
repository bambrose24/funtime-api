import {FieldResolver, Resolver, Root, ID, ObjectType, Field, Int} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {League, LeagueMember, User} from '@prisma/client';
import {datastore} from '@shared/datastore';
import _ from 'lodash';
import {withRankingField} from '@util/withRankingField';
import {PRISMA_CACHES} from '@util/const';

@ObjectType('LeagueRanking')
export class LeagueRanking {
  @Field(() => ID)
  id: string;

  @Field(() => TypeGraphQL.LeagueMember)
  member: LeagueMember;

  @Field(() => TypeGraphQL.User)
  user: User;

  @Field(() => Int)
  ranking: number;

  @Field(() => Int)
  correct: number;

  @Field(() => Int)
  wrong: number;
}

@Resolver(() => TypeGraphQL.League)
export default class LeagueRankingsResolver {
  @FieldResolver(() => [LeagueRanking!], {
    description:
      'A more efficient way to query for a member and the underlying person at the same time',
  })
  async rankings(@Root() league: League): Promise<LeagueRanking[]> {
    // TODO: use httpContext? although this should only be fetched once per league which is ok
    const [picksUnsorted, memberPeople] = await Promise.all([
      datastore.pick.groupBy({
        by: ['member_id', 'correct'], // Group by user ID and membership ID
        where: {
          leaguemembers: {
            league_id: league.league_id,
          },
          done: 1,
        },
        _count: {
          _all: true, // Count all fields (this will give us the count of correct picks for each member)
        },
        // cacheStrategy PRISMA_CACHES.oneMinute,
      }),
      datastore.leagueMember.findMany({
        where: {league_id: league.league_id},
        include: {people: true},
        // cacheStrategy PRISMA_CACHES.oneHour,
      }),
    ]);

    const memberIdToMemberPeople = memberPeople.reduce((prev, curr) => {
      prev[curr.membership_id] = curr;
      return prev;
    }, {} as Record<number, typeof memberPeople[number]>);

    const memberIdToAggregates = picksUnsorted.reduce((prev, curr) => {
      if (!curr || !curr.member_id) {
        return prev;
      }
      if (!(curr.member_id in prev)) {
        prev[curr.member_id] = [];
      }
      prev[curr.member_id].push(curr);
      return prev;
    }, {} as Record<number, typeof picksUnsorted>);

    const resultNoRanks: Array<Omit<LeagueRanking, 'ranking'>> = Object.keys(
      memberIdToAggregates
    ).map((memberIdRaw, i) => {
      const memberIdString = String(memberIdRaw);
      const memberIdNumber = Number(memberIdString);
      const aggregates = memberIdToAggregates[memberIdNumber];

      const correct = aggregates.find(a => a.correct === 1)?._count?._all ?? 0;
      const wrong = aggregates.find(a => a.correct === 0)?._count?._all ?? 0;

      return {
        id: memberIdString,
        correct,
        wrong,
        member: memberIdToMemberPeople[memberIdNumber]!,
        user: memberIdToMemberPeople[memberIdNumber]!.people,
      };
    });

    return withRankingField(
      _.orderBy(
        resultNoRanks,
        [
          'correct',
          x => {
            return x.user.username.toLowerCase();
          },
        ],
        ['desc', 'asc']
      ),
      x => x.correct
    );
  }
}
