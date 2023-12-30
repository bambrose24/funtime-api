import {FieldResolver, Resolver, Root, ID, ObjectType, Field, Arg} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {League, Pick} from '@prisma/client';
import {datastore} from '@shared/datastore';
import {PRISMA_CACHES} from '@util/const';

@Resolver(() => TypeGraphQL.League)
export default class LeaguePickResolver {
  @FieldResolver(() => [TypeGraphQL.Pick], {
    description: `A more efficient way to query for a league's picks if you need it`,
  })
  async picks(
    @Root() league: League,
    @Arg('where', _type => TypeGraphQL.PickWhereInput, {nullable: true})
    whereArg: TypeGraphQL.PickWhereInput | null
  ): Promise<Pick[]> {
    return await datastore.pick.findMany({
      where: {...(whereArg ?? {}), leaguemembers: {league_id: league.league_id}},
      // cacheStrategy PRISMA_CACHES.oneMinute,
    });
  }
}
