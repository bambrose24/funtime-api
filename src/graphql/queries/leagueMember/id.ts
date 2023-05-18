import {FieldResolver, Resolver, Root, ID} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {LeagueMember} from '@prisma/client';

@Resolver(() => TypeGraphQL.LeagueMember)
export default class LeagueMemberID {
  @FieldResolver(_type => ID)
  async id(@Root() leagueMember: LeagueMember): Promise<string> {
    return leagueMember.membership_id.toString();
  }
}
