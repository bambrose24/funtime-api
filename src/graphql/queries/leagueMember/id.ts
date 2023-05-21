import {FieldResolver, Resolver, Root, ID, Int, ObjectType, Field} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {LeagueMember} from '@prisma/client';
import {getNextGame} from '@shared/queries/getNextGame';
import datastore from '@shared/datastore';

@Resolver(() => TypeGraphQL.LeagueMember)
export default class LeagueMemberID {
  @FieldResolver(_type => ID)
  async id(@Root() leagueMember: LeagueMember): Promise<string> {
    return leagueMember.membership_id.toString();
  }

  @FieldResolver(_type => TypeGraphQL.Game, {nullable: true})
  async nextGame(@Root() _leagueMember: LeagueMember): Promise<TypeGraphQL.Game | null> {
    return await getNextGame();
  }

  @FieldResolver(_type => Boolean)
  async hasPickedNextGame(@Root() leagueMember: LeagueMember): Promise<boolean> {
    const nextGame = await getNextGame();
    if (!nextGame) {
      return true;
    }
    const pick = await datastore.pick.findFirst({
      where: {member_id: leagueMember.membership_id, gid: nextGame.gid},
    });
    return Boolean(pick);
  }
}
