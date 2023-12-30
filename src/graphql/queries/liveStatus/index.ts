import {Ctx, Field, FieldResolver, ID, Int, ObjectType, Resolver, Root} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {ApolloContext} from 'src/graphql/server/types';
import {getGamesByWeek} from '../../../shared/mysportsfeeds';
import {MSFGamePlayedStatus} from '../../../shared/mysportsfeeds/types';
import {Game} from '@prisma/client';
import {timeout} from '@util/timeout';
import {logger} from '@util/logger';

@ObjectType('GameLive')
class GameLive {
  @Field(() => ID)
  id: string;
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
    @Ctx() {prisma: datastore}: ApolloContext
  ): Promise<GameLive | undefined | null> {
    try {
      const [teams, msfGames] = await Promise.all([
        datastore.team.findMany({where: {teamid: {gt: 0}}, cacheStrategy: {swr: 1000, ttl: 1000}}),
        timeout(
          getGamesByWeek(game.season, game.week),
          3000,
          'getGamesByWeek timed out after 3 seconds'
        ),
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

      logger.info(`msfGame for ${game.gid}: ${JSON.stringify(msfGame)}`);

      return {
        id: `msf_${game.gid}`,
        currentQuarter: msfGame.score.currentQuarter,
        currentQuarterSecondsRemaining: msfGame.score.currentQuarterSecondsRemaining,
        playedStatus: msfGame.schedule.playedStatus,
      };
    } catch (e) {
      console.error(`Error fetching liveStatus for ${game.gid}: ${e}`);
      return null;
    }
  }
}
