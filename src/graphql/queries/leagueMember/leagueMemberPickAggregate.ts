import {Arg, Ctx, Field, Int, FieldResolver, ObjectType, Resolver, Root} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {ApolloPrismaContext} from 'src/graphql/server/types';
import {LeagueMember} from '@prisma/client';

@ObjectType()
class PickAggregateResponse {
  @Field(_type => Int)
  count: number;
}
@Resolver(() => TypeGraphQL.LeagueMember)
export default class LeagueMemberPickAggregateResolver {
  @FieldResolver(_type => PickAggregateResponse)
  async aggregatePick(
    @Root() member: LeagueMember,
    @Ctx() {prisma: datastore}: ApolloPrismaContext,
    @Arg('where', _type => TypeGraphQL.PickWhereInput, {nullable: true})
    where: Parameters<typeof datastore.pick.aggregate>[0]['where']
  ): Promise<PickAggregateResponse> {
    console.log('hiiii', where);
    const res = await datastore.pick.aggregate({
      _count: {pickid: true},
      where: {...where, member_id: member.membership_id},
    });

    return {count: res._count.pickid};
  }
}
