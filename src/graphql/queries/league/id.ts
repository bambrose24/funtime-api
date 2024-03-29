import {FieldResolver, Resolver, Root, ID, registerEnumType, Ctx, Arg} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {Game, League, LeagueMember} from '@prisma/client';
import {datastore} from '@shared/datastore';
import {AggregateResponse} from '@graphql/util/aggregateResponse';
import {ApolloContext} from '@graphql/server/types';
import {getUser} from '@shared/auth/user';
import {PRISMA_CACHES} from '@util/const';

enum LeagueStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

registerEnumType(LeagueStatus, {
  name: 'LeagueStatus',
});

@Resolver(() => TypeGraphQL.League)
export default class LeagueID {
  @FieldResolver(_type => ID)
  async id(@Root() league: League): Promise<string> {
    return league.league_id.toString();
  }

  @FieldResolver(() => LeagueStatus)
  async status(@Root() league: League): Promise<LeagueStatus> {
    const now = new Date();
    const [firstGame, lastGame] = await Promise.all([
      datastore.game.findFirst({
        where: {season: league.season},
        orderBy: {ts: 'asc'},
        // cacheStrategy PRISMA_CACHES.oneMinute,
      }),
      datastore.game.findFirst({
        where: {season: league.season},
        orderBy: {ts: 'desc'},
        // cacheStrategy PRISMA_CACHES.oneMinute,
      }),
    ]);

    if (firstGame && now < firstGame.ts) {
      return LeagueStatus.NOT_STARTED;
    }
    if (lastGame && now < lastGame.ts) {
      return LeagueStatus.IN_PROGRESS;
    }
    if (lastGame && !lastGame.done) {
      return LeagueStatus.IN_PROGRESS;
    }
    return LeagueStatus.DONE;
  }

  @FieldResolver(_type => AggregateResponse)
  async aggregateLeagueMember(
    @Root() league: League,
    @Ctx() {prisma: datastore}: ApolloContext,
    @Arg('where', _type => TypeGraphQL.LeagueMemberWhereInput, {nullable: true})
    where: TypeGraphQL.LeagueMemberWhereInput
  ): Promise<AggregateResponse> {
    const res = await datastore.leagueMember.aggregate({
      _count: {membership_id: true},
      where: {...where, league_id: league.league_id},
    });

    return {count: res._count.membership_id};
  }

  @FieldResolver(_type => TypeGraphQL.LeagueMember, {nullable: true})
  async viewer(
    @Root() league: League,
    @Ctx() {prisma: datastore}: ApolloContext
  ): Promise<LeagueMember | null> {
    const {dbUser} = getUser() ?? {};
    if (!dbUser) {
      return null;
    }
    return await datastore.leagueMember.findFirst({
      where: {league_id: league.league_id, people: {uid: dbUser.uid}},
      // cacheStrategy PRISMA_CACHES.oneMinute,
    });
  }

  @FieldResolver(_type => TypeGraphQL.Game, {nullable: true})
  async mostRecentlyStartedGame(
    @Root() league: League,
    @Ctx() {prisma: datastore}: ApolloContext
  ): Promise<Game | null> {
    const now = new Date();
    // TODO should we cache a more broad query then filter in memory?
    return await datastore.game.findFirst({
      where: {season: league.season, ts: {lte: now}},
      orderBy: {ts: 'asc'},
    });
  }
}
