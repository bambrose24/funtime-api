import {FieldResolver, Resolver, Root, ID} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {Pick} from '@prisma/client';

@Resolver(() => TypeGraphQL.Pick)
export default class PickID {
  @FieldResolver(_type => ID)
  async id(@Root() pick: Pick): Promise<string> {
    return pick.pickid.toString();
  }
}
