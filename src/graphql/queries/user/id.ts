import {FieldResolver, Resolver, Root, ID, Int, Arg} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {League, LeagueMember, User} from '@prisma/client';
import {datastore} from '@shared/datastore';
import {PRISMA_CACHES} from '@util/const';

@Resolver(() => TypeGraphQL.User)
export default class UserID {
  @FieldResolver(_type => ID)
  async id(@Root() user: User): Promise<string> {
    return user.uid.toString();
  }

  @FieldResolver(_type => TypeGraphQL.League, {nullable: true})
  async league(
    @Root() user: User,
    @Arg('league_id', () => Int)
    league_id: number
  ): Promise<League | null> {
    const membership = await datastore.leagueMember.findFirst({
      where: {league_id, user_id: user.uid},
      // cacheStrategy PRISMA_CACHES.oneHour,
    });
    if (!membership) {
      return null;
    }
    return await datastore.league.findFirst({where: {league_id}});
  }

  @FieldResolver(_type => TypeGraphQL.LeagueMember, {nullable: true})
  async leagueMember(
    @Root() user: User,
    @Arg('league_id', () => Int)
    league_id: number
  ): Promise<LeagueMember | null> {
    const membership = await datastore.leagueMember.findFirst({
      where: {league_id, user_id: user.uid},
      // cacheStrategy PRISMA_CACHES.oneHour,
    });
    if (!membership) {
      return null;
    }
    return membership ?? null;
  }
}
