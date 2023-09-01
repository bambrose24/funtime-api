import {FieldResolver, Resolver, Root, Ctx} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {League} from '@prisma/client';
import {ApolloContext} from '@graphql/server/types';
import {
  getLatePickPolicyDescription,
  getPickPolicyDescription,
  getReminderPolicyDescription,
  getScoringTypeDescription,
  getSuperbowlRuleDescription,
  LeagueRuleWithExplanation,
} from '@shared/leagues/rules';
import datastore from '@shared/datastore';

@Resolver(() => TypeGraphQL.League)
export default class LeagueRulesResolver {
  @FieldResolver(_type => [LeagueRuleWithExplanation])
  async rules(
    @Root() league: League,
    @Ctx() {prisma: _datastore}: ApolloContext
  ): Promise<LeagueRuleWithExplanation[]> {
    return await getRulesForLeague(league.league_id);
  }
}

export async function getRulesForLeague(league_id: number): Promise<LeagueRuleWithExplanation[]> {
  const league = await datastore.league.findFirstOrThrow({where: {league_id}});
  const rules: LeagueRuleWithExplanation[] = [
    ...(league.late_policy
      ? [
          {
            id: `${league.league_id}-late_policy`,
            name: 'Late Pick Policy',
            description: getLatePickPolicyDescription(league.late_policy),
          },
        ]
      : []),
    ...(league.pick_policy
      ? [
          {
            id: `${league.league_id}-pick_policy`,
            name: 'Winner Policy',
            description: getPickPolicyDescription(league.pick_policy),
          },
        ]
      : []),
    ...(league.reminder_policy
      ? [
          {
            id: `${league.league_id}-reminder_policy`,
            name: 'Reminders',
            description: getReminderPolicyDescription(league.reminder_policy),
          },
        ]
      : []),
    ...(league.scoring_type
      ? [
          {
            id: `${league.league_id}-scoring_type`,
            name: 'Weekly Scoring Type',
            description: getScoringTypeDescription(league.scoring_type),
          },
        ]
      : []),
    ...(league.superbowl_competition !== null
      ? [
          {
            id: `${league.league_id}-superbowl_competition`,
            name: 'Super Bowl Competition',
            description: getSuperbowlRuleDescription(league.superbowl_competition),
          },
        ]
      : []),
  ];
  return rules;
}
