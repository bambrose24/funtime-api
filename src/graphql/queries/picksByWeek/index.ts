/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {Game, MemberRole, Pick, Prisma} from '@prisma/client';
import datastore from '@shared/datastore';
import moment from 'moment';
import * as TypeGraphQL from '@generated/type-graphql';
import {Arg, Field, Int, ObjectType, Query} from 'type-graphql';
import {now} from '@util/time';
import {getUserEnforced} from '@shared/auth/user';

@ObjectType()
class PicksByWeekResponse {
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
}

class PicksByWeekResolver {
  @Query(() => PicksByWeekResponse)
  async picksByWeek(
    @Arg('league_id', () => Int)
    league_id: number,
    @Arg('week', () => Int, {nullable: true})
    week: number | null
  ): Promise<PicksByWeekResponse> {
    console.log('picksByWeek args', week, league_id);
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
        week,
        season,
        canView: override || false,
        picks: [],
        games: [],
      };
    }

    const {week: realWeek, season: realSeason} = games[0];

    const canView = games[0].ts < moment().toDate();

    const picks = await datastore.pick.findMany({
      where: {
        week: {equals: realWeek},
        season: {equals: realSeason},
        member_id: {in: members.map(m => m.membership_id)},
      },
    });

    return {
      week: realWeek,
      season: realSeason,
      canView: override || canView,
      picks,
      games,
    };
  }
}

export default PicksByWeekResolver;
