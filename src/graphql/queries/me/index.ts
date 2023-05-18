import {Query, Resolver} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import datastore from '@shared/datastore';
import {getUser} from '@shared/auth/user';

export default class MeQuery {
  @Query(() => TypeGraphQL.User, {nullable: true})
  async me(): Promise<TypeGraphQL.User | null> {
    const user = getUser();
    if (!user) {
      return null;
    }
    return await datastore.user.findFirst({where: {email: user.email}});
  }
}
