import {FieldResolver, Resolver, Root, ID} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {Game} from '@prisma/client';

@Resolver(() => TypeGraphQL.Game)
export default class GameID {
  @FieldResolver(_type => ID)
  async id(@Root() game: Game): Promise<string> {
    return game.gid.toString();
  }

  @FieldResolver(_type => Boolean)
  async started(@Root() game: Game): Promise<boolean> {
    const now = new Date();
    return game.ts < now;
  }
}
