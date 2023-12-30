import {Arg, Ctx, FieldResolver, Resolver, Root} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {ApolloContext} from 'src/graphql/server/types';
import {Game, League} from '@prisma/client';
import {PRISMA_CACHES} from '@util/const';

@Resolver(() => TypeGraphQL.League)
export default class LeagueGames {
  @FieldResolver(_type => [TypeGraphQL.Game])
  async games(
    @Root() league: League,
    @Ctx() {prisma: datastore}: ApolloContext,
    @Arg('where', _type => TypeGraphQL.GameWhereInput, {nullable: true})
    where: TypeGraphQL.GameWhereInput
  ): Promise<Game[]> {
    return await datastore.game.findMany({
      where: {...where, season: league.season},
      // cacheStrategy PRISMA_CACHES.oneMinute,
    });
  }
}
