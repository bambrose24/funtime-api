import {Arg, Ctx, FieldResolver, Resolver, Root} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {ApolloContext} from 'src/graphql/server/types';
import {Game, LeagueMember} from '@prisma/client';
import {AggregateResponse} from '@graphql/util/aggregateResponse';
import {datastore} from '@shared/datastore';

type T = Parameters<typeof datastore.pick.aggregate>;

@Resolver(() => TypeGraphQL.LeagueMember)
export default class LeagueMemberPickAggregateResolver {
  @FieldResolver(_type => AggregateResponse)
  async aggregatePick(
    @Root() member: LeagueMember,
    @Ctx() {prisma: datastore}: ApolloContext,
    @Arg('where', _type => TypeGraphQL.PickWhereInput, {nullable: true})
    where: TypeGraphQL.PickWhereInput
  ): Promise<AggregateResponse> {
    const res = await datastore.pick.aggregate({
      _count: {pickid: true},
      where: {...where, member_id: member.membership_id},
    });

    return {count: res._count.pickid};
  }
}
