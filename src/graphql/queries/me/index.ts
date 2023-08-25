import {Arg, Query, Resolver} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import datastore from '@shared/datastore';
import {getUser} from '@shared/auth/user';

export default class MeQuery {
  @Query(() => TypeGraphQL.User, {nullable: true})
  async me(): Promise<TypeGraphQL.User | null> {
    const {dbUser} = getUser() ?? {};
    if (!dbUser) {
      return null;
    }
    // we already get it from setting up the httpContext in middleware
    // so we don't need to refetch or anything
    return dbUser;
  }
}
