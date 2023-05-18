import {FieldResolver, Resolver, Root, ID} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {User} from '@prisma/client';

@Resolver(() => TypeGraphQL.User)
export default class UserID {
  @FieldResolver(_type => ID)
  async id(@Root() user: User): Promise<string> {
    return user.uid.toString();
  }
}
