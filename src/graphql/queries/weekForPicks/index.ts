import {Game, LeagueMember, LeagueMessage, MessageStatus, MessageType, Pick} from '@prisma/client';
import {datastore} from '@shared/datastore';
import * as TypeGraphQL from '@generated/type-graphql';
import {Arg, Field, ID, Int, ObjectType, Query} from 'type-graphql';
import {now} from '@util/time';
import {DEFAULT_SEASON, PRISMA_CACHES} from '@util/const';
import {getUser} from '@shared/auth/user';

@ObjectType()
class WeekForPicksResponse {
  @Field(() => ID)
  id: string;
  @Field(() => Int, {nullable: true})
  week: number | null;
  @Field(() => Int, {nullable: true})
  season: number | null;
  @Field(() => [TypeGraphQL.Game]!)
  games: Array<Game>;
  @Field(() => [TypeGraphQL.Pick]!)
  existingPicks: Array<Pick>;
  @Field(() => TypeGraphQL.LeagueMember, {nullable: true})
  leagueMember: LeagueMember | null;
  @Field(() => [TypeGraphQL.LeagueMessage])
  messages: LeagueMessage[];
}

export class WeekForPicksResolver {
  @Query(() => WeekForPicksResponse)
  async weekForPicks(
    @Arg('leagueId', () => Int)
    league_id: number,
    @Arg('memberId', () => Int, {nullable: true})
    member_id: number | null,
    @Arg('override', () => Boolean, {nullable: true})
    override?: boolean | null,
    @Arg('week', () => Int, {nullable: true})
    weekArg?: number | null
  ): Promise<WeekForPicksResponse> {
    const user = getUser();
    if (!user || !user.dbUser) {
      throw new Error('Need registered authd user to make picks');
    }

    const viewerMember = await datastore.leagueMember.findFirstOrThrow({
      where: {league_id, people: {uid: user.dbUser.uid}},
      // cacheStrategy PRISMA_CACHES.oneHour,
    });

    if (member_id) {
      const otherMember = await datastore.leagueMember.findFirst({
        where: {
          league_id,
          membership_id: member_id,
        },
        // cacheStrategy PRISMA_CACHES.oneHour,
      });
      if (!otherMember) {
        throw new Error(`Could not find member ${member_id} to make picks on behalf of`);
      }
      if (viewerMember.role !== 'admin') {
        throw new Error('Cannot try to make picks on someones behalf if youre not an admin');
      }
    }
    const memberId = member_id ?? viewerMember.membership_id;

    let week: number;
    let season: number;
    if (weekArg && override) {
      week = weekArg;
      season = DEFAULT_SEASON;
    } else {
      const res = await findWeekForPicks({league_id, member_id: memberId});
      if (res === null) {
        return {
          id: `${league_id}_${member_id}${
            override !== undefined && override !== null ? `_${override}` : ``
          }${weekArg !== undefined && weekArg !== null ? `_${weekArg}` : ``}`,
          week: null,
          season: null,
          games: [],
          existingPicks: [],
          leagueMember: null,
          messages: [],
        };
      }

      week = res.week;
      season = res.season;
    }

    const [games, existingPicks, leagueMember, messages] = await Promise.all([
      datastore.game.findMany({
        where: {week, season},
        orderBy: {ts: 'asc'},
        // cacheStrategy PRISMA_CACHES.oneMinute,
      }),
      week !== null && week !== undefined
        ? datastore.pick.findMany({
            where: {week, leaguemembers: {league_id, membership_id: memberId}},
            // cacheStrategy PRISMA_CACHES.oneMinute,
          })
        : [],
      datastore.leagueMember.findFirst({
        where: {membership_id: memberId},
        // cacheStrategy PRISMA_CACHES.oneMinute,
      }),
      datastore.leagueMessage.findMany({
        where: {
          league_id,
          message_type: MessageType.WEEK_COMMENT,
          status: MessageStatus.PUBLISHED,
          week,
        },
        orderBy: {createdAt: 'asc'},
        // cacheStrategy PRISMA_CACHES.oneMinute,
      }),
    ]);

    return {
      id: `${league_id}_${memberId}${
        override !== undefined && override !== null ? `_${override}` : ``
      }${week !== undefined && week !== null ? `_${week}` : ``}`,
      week,
      season,
      games,
      existingPicks,
      leagueMember,
      messages,
    };
  }
}

async function findWeekForPicks({
  league_id,
  member_id,
}: {
  league_id: number;
  member_id: number;
}): Promise<{
  week: number;
  season: number;
} | null> {
  const [gamesWithinMonth, league, memberPicks] = await Promise.all([
    datastore.game.findMany({
      where: {
        ts: {
          gte: now()
            .subtract({months: 1})
            .toDate(),
          lte: now()
            .add({months: 1})
            .toDate(),
        },
      },
      orderBy: {ts: 'asc'},
      // cacheStrategy PRISMA_CACHES.oneMinute,
    }),
    datastore.league.findFirstOrThrow({
      where: {league_id},
      // cacheStrategy PRISMA_CACHES.oneMinute
    }),
    datastore.pick.findMany({
      where: {member_id},
      // cacheStrategy PRISMA_CACHES.oneMinute
    }),
  ]);

  const nextUnstartedGame = firstNotStartedGame(gamesWithinMonth);
  const nextUnstartedWeek = firstNotStartedWeek(gamesWithinMonth);

  switch (league.late_policy) {
    case 'allow_late_whole_week':
      return nextUnstartedGame;
    case 'close_at_first_game_start':
      return nextUnstartedWeek;
    case 'allow_late_and_lock_after_start':
      if (!nextUnstartedGame) {
        return null;
      }
      const hasPicksForCurrentWeek = memberPicks.some(p => p.week === nextUnstartedGame.week);
      const hasWeekStarted = weekHasStarted(gamesWithinMonth, nextUnstartedGame.week);
      if (hasPicksForCurrentWeek && hasWeekStarted) {
        return nextUnstartedWeek;
      }
      return nextUnstartedGame;
  }

  return null;
}

function weekHasStarted(gamesSorted: Array<Game>, week: number) {
  const now = new Date();
  return gamesSorted.some(g => g.week === week && g.ts < now);
}

function firstNotStartedGame(gamesSorted: Array<Game>) {
  const now = new Date();
  for (const game of gamesSorted) {
    if (game.ts > now) {
      return {week: game.week, season: game.season};
    }
  }
  return null;
}

function firstNotStartedWeek(gamesSorted: Array<Game>) {
  const now = new Date();
  const startedWeekSeasons = new Set();
  for (const game of gamesSorted) {
    if (game.ts < now) {
      startedWeekSeasons.add(`${game.week},${game.season}`);
    }
  }
  for (const game of gamesSorted) {
    if (!startedWeekSeasons.has(`${game.week},${game.season}`)) {
      return {week: game.week, season: game.season};
    }
  }
  return null;
}
