import {FieldResolver, Resolver, Root, ID, registerEnumType, Ctx, Arg} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {League} from '@prisma/client';
import datastore from '@shared/datastore';
import {AggregateResponse} from '@graphql/util/aggregateResponse';
import {ApolloPrismaContext} from '@graphql/server/types';
import {getUser} from '@shared/auth/user';

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

  @FieldResolver(_type => Boolean)
  async isViewerMember(@Root() league: League): Promise<boolean> {
    const {dbUser} = getUser() ?? {};
    if (!dbUser) return false;

    const membership = await datastore.leagueMember.findFirst({
      where: {league_id: league.league_id, user_id: dbUser.uid},
    });
    return membership !== undefined;
  }

  @FieldResolver(() => LeagueStatus)
  async status(@Root() league: League): Promise<LeagueStatus> {
    const now = new Date();
    const [firstGame, lastGame] = await Promise.all([
      datastore.game.findFirst({where: {season: league.season}, orderBy: {ts: 'desc'}}),
      datastore.game.findFirst({where: {season: league.season}, orderBy: {ts: 'asc'}}),
    ]);

    if (firstGame && now < firstGame.ts) {
      return LeagueStatus.NOT_STARTED;
    }
    if (lastGame && now < lastGame.ts) {
      return LeagueStatus.IN_PROGRESS;
    }
    return LeagueStatus.DONE;
  }

  @FieldResolver(_type => AggregateResponse)
  async aggregateLeagueMember(
    @Root() league: League,
    @Ctx() {prisma: datastore}: ApolloPrismaContext,
    @Arg('where', _type => TypeGraphQL.LeagueMemberWhereInput, {nullable: true})
    where: Parameters<typeof datastore.pick.aggregate>[0]['where']
  ): Promise<AggregateResponse> {
    const res = await datastore.leagueMember.aggregate({
      _count: {membership_id: true},
      where: {...where, league_id: league.league_id},
    });

    return {count: res._count.membership_id};
  }
}
