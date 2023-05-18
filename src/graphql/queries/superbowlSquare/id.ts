import {FieldResolver, Resolver, Root, ID} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {SuperbowlSquare} from '@prisma/client';

@Resolver(() => TypeGraphQL.SuperbowlSquare)
export default class SuperbowlSquareID {
  @FieldResolver(_type => ID)
  async id(@Root() superbowlSquare: SuperbowlSquare): Promise<string> {
    return superbowlSquare.square_id.toString();
  }
}
