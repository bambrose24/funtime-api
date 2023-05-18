import {FieldResolver, Resolver, Root, ID} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {Superbowl} from '@prisma/client';

@Resolver(() => TypeGraphQL.Superbowl)
export default class SuperbowlID {
  @FieldResolver(_type => ID)
  async id(@Root() superbowl: Superbowl): Promise<string> {
    return superbowl.pickid.toString();
  }
}
