import {Arg, Ctx, Field, Int, FieldResolver, ObjectType, Resolver, Root} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {ApolloPrismaContext} from 'src/graphql/server/types';
import {Game, League, LeagueMember} from '@prisma/client';

@Resolver(() => TypeGraphQL.League)
export default class LeagueGames {
  @FieldResolver(_type => [TypeGraphQL.Game])
  async games(
    @Root() league: League,
    @Ctx() {prisma: datastore}: ApolloPrismaContext,
    @Arg('where', _type => TypeGraphQL.GameWhereInput, {nullable: true})
    where: TypeGraphQL.GameWhereInput
  ): Promise<Game[]> {
    return await datastore.game.findMany({where: {...where, season: league.season}});
  }
}
