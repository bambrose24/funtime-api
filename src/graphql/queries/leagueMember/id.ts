import {FieldResolver, Resolver, Root, ID, Int, ObjectType, Field} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {LeagueMember} from '@prisma/client';
import {getNextGame} from '@shared/queries/getNextGame';
import datastore from '@shared/datastore';
import {RequestContext} from '@util/request-context';
import {PRISMA_CACHES} from '@util/const';

@Resolver(() => TypeGraphQL.LeagueMember)
export default class LeagueMemberID {
  @FieldResolver(_type => ID)
  async id(@Root() leagueMember: LeagueMember): Promise<string> {
    return leagueMember.membership_id.toString();
  }

  @FieldResolver(_type => TypeGraphQL.Game, {nullable: true})
  async nextGame(@Root() leagueMember: LeagueMember): Promise<TypeGraphQL.Game | null> {
    const game = await RequestContext.get('getNextGame', {leagueId: leagueMember.league_id});
    return game ?? null;
  }

  @FieldResolver(_type => Boolean)
  async hasPickedNextGame(@Root() leagueMember: LeagueMember): Promise<boolean> {
    const nextGame = await RequestContext.get('getNextGame', {leagueId: leagueMember.league_id});
    if (!nextGame) {
      return true;
    }
    const pick = await datastore.pick.findFirst({
      where: {member_id: leagueMember.membership_id, gid: nextGame.gid},
      // cacheStrategy PRISMA_CACHES.oneMinute,
    });
    return Boolean(pick);
  }
}
