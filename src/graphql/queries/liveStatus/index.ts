import {Ctx, Field, FieldResolver, ID, Int, ObjectType, Resolver, Root} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {ApolloContext} from 'src/graphql/server/types';
import {MSFGamePlayedStatus} from '../../../shared/dataproviders/mysportsfeeds/types';
import {Game} from '@prisma/client';
import {timeout} from '@util/timeout';
import {logger} from '@util/logger';
import {RequestContext} from '@util/request-context';

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
    // const nullItOut: boolean = true;
    // if (nullItOut) return null;
    try {
      const [teams, providerGames] = await Promise.all([
        datastore.team.findMany({
          where: {teamid: {gt: 0}},
          // cacheStrategy PRISMA_CACHES.oneDay
        }),
        timeout(
          RequestContext.get('getGamesByWeek', game),
          3000,
          'getGamesByWeek timed out after 3 seconds'
        ),
      ]);
      const homeTeam = teams.find(t => t.teamid === game.home)!;
      const awayTeam = teams.find(t => t.teamid === game.away)!;
      const providerGame = providerGames?.find(
        g => g.homeAbbrev === homeTeam.abbrev && g.awayAbbrev === awayTeam.abbrev
      );

      if (!providerGame) {
        return null;
      }

      logger.info(`msfGame for ${game.gid}: ${JSON.stringify(providerGame)}`);

      return {
        id: `msf_${game.gid}`,
        currentQuarter: providerGame.quarter,
        currentQuarterSecondsRemaining: providerGame.secondsInQuarter,
        playedStatus:
          providerGame.status === 'done'
            ? MSFGamePlayedStatus.COMPLETED
            : providerGame.status === 'in_progress'
            ? MSFGamePlayedStatus.LIVE
            : providerGame.status === 'not_started'
            ? MSFGamePlayedStatus.UNPLAYED
            : MSFGamePlayedStatus.UNPLAYED,
      };
    } catch (e) {
      console.error(`Error fetching liveStatus for ${game.gid}: ${e}`);
      return null;
    }
  }
}
