import {FieldResolver, Resolver, Root, ID} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {League} from '@prisma/client';

@Resolver(() => TypeGraphQL.League)
export default class LeagueID {
  @FieldResolver(_type => ID)
  async id(@Root() league: League): Promise<string> {
    return league.league_id.toString();
  }
}
