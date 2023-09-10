import {FieldResolver, Resolver, Root, ID, ObjectType, Field} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {League, LeagueMember, User} from '@prisma/client';
import datastore from '@shared/datastore';
import _ from 'lodash';

@ObjectType('LeagueMemberPeople')
export class MemberPeople {
  @Field(() => ID)
  id: string | null;

  @Field(() => TypeGraphQL.User)
  user: User;

  @Field(() => TypeGraphQL.LeagueMember)
  member: LeagueMember;
}

@Resolver(() => TypeGraphQL.League)
export default class LeagueMemberPeopleResolver {
  @FieldResolver(() => [MemberPeople], {
    description:
      'A more efficient way to query for a member and the underlying person at the same time',
  })
  async memberpeople(@Root() league: League): Promise<MemberPeople[]> {
    const league_id = league.league_id;

    const membersAndPeople = await datastore.leagueMember.findMany({
      where: {league_id},
      include: {people: true},
    });

    return membersAndPeople.map(m => {
      return {
        id: `${m.membership_id}_${m.people.uid}`,
        member: m,
        user: m.people,
      };
    });
  }
}
