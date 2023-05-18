import {FieldResolver, Resolver, Root, ID} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {Team} from '@prisma/client';

@Resolver(() => TypeGraphQL.Team)
export default class TeamID {
  @FieldResolver(_type => ID)
  async id(@Root() team: Team): Promise<string> {
    return team.teamid.toString();
  }
}
