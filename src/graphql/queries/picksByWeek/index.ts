/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Game,
  LatePolicy,
  LeagueMessage,
  MemberRole,
  MessageStatus,
  MessageType,
  Pick,
  Prisma,
} from '@prisma/client';
import datastore from '@shared/datastore';
import moment from 'moment';
import * as TypeGraphQL from '@generated/type-graphql';
import {Arg, Field, ID, Int, ObjectType, Query} from 'type-graphql';
import {now} from '@util/time';
import {getUserEnforced} from '@shared/auth/user';

@ObjectType()
class PicksByWeekResponse {
  @Field(() => ID)
  id: string;
  @Field(() => Int, {nullable: true})
  week: number | null;
  @Field(() => Int, {nullable: true})
  season: number;
  @Field()
  canView: boolean;
  @Field(() => [TypeGraphQL.Pick]!)
  picks: Array<Pick>;
  @Field(() => [TypeGraphQL.Game]!)
  games: Array<Game>;
  @Field(() => [TypeGraphQL.LeagueMessage])
  messages: LeagueMessage[];
}

class PicksByWeekResolver {
  @Query(() => PicksByWeekResponse)
  async picksByWeek(
    @Arg('league_id', () => Int)
    league_id: number,
    @Arg('week', () => Int, {nullable: true})
    week: number | null
  ): Promise<PicksByWeekResponse> {
    const {dbUser} = getUserEnforced();
    const [league, member, members] = await Promise.all([
      datastore.league.findFirst({
        where: {league_id: {equals: league_id}},
      }),
      dbUser?.uid
        ? datastore.leagueMember.findFirst({
            where: {
              league_id,
              user_id: dbUser.uid,
            },
          })
        : null,
      datastore.leagueMember.findMany({where: {league_id}}),
    ]);

    const override = member?.role === MemberRole.admin;

    const season = league?.season;

    if (!season) {
      throw new Error(`could not find season from league_id ${league_id}`);
    }

    let games: Array<Game> | undefined;
    const whereInput: Prisma.GameWhereInput = {};

    if (week) {
      whereInput['week'] = {equals: week};
      whereInput['season'] = {equals: season};

      games = await datastore.game.findMany({
        where: whereInput,
        orderBy: {ts: 'asc'},
      });
    } else {
      const lastStartedGame = await datastore.game.findFirst({
        where: {
          ts: {lte: now().toDate()},
          season: {equals: season},
        },
        orderBy: {ts: 'desc'},
      });
      if (!lastStartedGame) {
        games = [];
      } else {
        games = await datastore.game.findMany({
          where: {
            week: {equals: lastStartedGame.week},
            season: {equals: lastStartedGame.season},
          },
          orderBy: {ts: 'asc'},
        });
      }
    }

    if (!games || games.length === 0) {
      return {
        id: `${week}_${season}`,
        week,
        season,
        canView: override || false,
        picks: [],
        games: [],
        messages: [],
      };
    }

    const {week: realWeek, season: realSeason} = games[0];

    const hasWeekStarted = games[0].ts < new Date();

    const [picks, messages] = await Promise.all([
      datastore.pick.findMany({
        where: {
          week: {equals: realWeek},
          season: {equals: realSeason},
          member_id: {in: members.map(m => m.membership_id)},
        },
      }),
      datastore.leagueMessage.findMany({
        where: {
          league_id,
          message_type: MessageType.WEEK_COMMENT,
          status: MessageStatus.PUBLISHED,
          week: realWeek,
        },
        orderBy: {createdAt: 'asc'},
      }),
    ]);

    const viewerHasPicks = picks.some(
      p => member?.membership_id && p.member_id === member.membership_id
    );

    const canView = canViewPicks({
      latePolicy: league.late_policy || 'close_at_first_game_start',
      viewerHasPicks,
      hasWeekStarted,
      override,
    });

    return {
      id: `${week}_${season}`,
      week: realWeek,
      season: realSeason,
      canView: override || canView,
      picks,
      games,
      messages,
    };
  }
}

function canViewPicks({
  latePolicy,
  viewerHasPicks,
  hasWeekStarted,
  override,
}: {
  latePolicy: LatePolicy;
  viewerHasPicks: boolean;
  hasWeekStarted: boolean;
  override: boolean;
}): boolean {
  if (override) {
    return true;
  }
  switch (latePolicy) {
    case 'allow_late_and_lock_after_start':
      return hasWeekStarted ? viewerHasPicks : false;
    case 'allow_late_whole_week':
      return hasWeekStarted ? true : false;
    case 'close_at_first_game_start':
      return hasWeekStarted ? true : false;
  }
}

export default PicksByWeekResolver;
