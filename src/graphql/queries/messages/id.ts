import {FieldResolver, Resolver, Root, ID} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {LeagueMessage} from '@prisma/client';

@Resolver(() => TypeGraphQL.LeagueMessage)
export default class LeagueMessageIDResolver {
  @FieldResolver(_type => ID)
  async id(@Root() leagueMessage: LeagueMessage): Promise<string> {
    return leagueMessage.message_id;
  }
}
