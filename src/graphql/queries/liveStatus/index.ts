import {Ctx, Field, FieldResolver, Int, ObjectType, Resolver, Root} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {ApolloPrismaContext} from 'src/graphql/server/types';
import {getGamesByWeek} from '../../../shared/mysportsfeeds';
import {MSFGamePlayedStatus} from '../../../shared/mysportsfeeds/types';
import {Game} from '@prisma/client';

@ObjectType('GameLive')
class GameLive {
  @Field(() => Int, {nullable: true})
  currentQuarter?: number | null | undefined;
  @Field(() => Int, {nullable: true})
  currentQuarterSecondsRemaining: number | null | undefined;
  @Field(() => MSFGamePlayedStatus, {nullable: true})
  playedStatus: MSFGamePlayedStatus | null | undefined;
}

@Resolver(() => TypeGraphQL.Game)
export default class GameLiveResolver {
  @FieldResolver(_type => GameLive, {nullable: true})
  async liveStatus(
    @Root() game: Game,
    @Ctx() {prisma: datastore}: ApolloPrismaContext
  ): Promise<GameLive | undefined | null> {
    const [teams, msfGames] = await Promise.all([
      datastore.team.findMany({where: {teamid: {gt: 0}}}),
      getGamesByWeek(game.season, game.week),
    ]);
    const homeTeam = teams.find(t => t.teamid === game.home)!;
    const awayTeam = teams.find(t => t.teamid === game.away)!;
    const msfGame = msfGames.find(
      g =>
        g.schedule.homeTeam.abbreviation === homeTeam.abbrev &&
        g.schedule.awayTeam.abbreviation === awayTeam.abbrev
    );

    if (!msfGame) {
      return null;
    }

    return {
      currentQuarter: msfGame.score.currentQuarter,
      currentQuarterSecondsRemaining: msfGame.score.currentQuarterSecondsRemaining,
      playedStatus: msfGame.schedule.playedStatus,
    };
  }
}
