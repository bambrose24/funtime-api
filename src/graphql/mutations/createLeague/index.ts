import {Arg, Mutation, Resolver} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {CreateLeagueInput} from './types';
import datastore from '@shared/datastore';
import {SEASON} from '@util/const';
import {getUser} from '@shared/auth/user';
import {nanoid} from 'nanoid';

@Resolver()
export class CreateLeagueMutation {
  @Mutation(() => TypeGraphQL.League)
  async createLeague(
    @Arg('data', () => CreateLeagueInput) data: CreateLeagueInput
  ): Promise<TypeGraphQL.League> {
    const {dbUser} = getUser() ?? {};
    if (!dbUser) {
      throw new Error(`Must be logged in to create a league`);
    }
    const uid = dbUser.uid;
    const league = await datastore.league.create({
      data: {
        name: data.leagueName,
        season: SEASON,
        created_by_user_id: uid,
        share_code: nanoid(),
        superbowl_competition: data.superbowlCompetition,
        late_policy: data.latePolicy,
        pick_policy: data.pickPolicy,
        reminder_policy: data.reminderPolicy,
        scoring_type: data.scoringType,
      },
    });

    const _membership = await datastore.leagueMember.create({
      data: {
        role: 'admin',
        league_id: league.league_id,
        user_id: uid,
      },
    });

    return league;
  }
}
