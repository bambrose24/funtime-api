import {FieldResolver, Resolver, Root, Ctx, Arg} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {League} from '@prisma/client';
import {AggregateResponse} from '@graphql/util/aggregateResponse';
import {ApolloPrismaContext} from '@graphql/server/types';
import {
  getLatePickPolicyDescription,
  getPickPolicyDescription,
  getReminderPolicyDescription,
  getScoringTypeDescription,
  getSuperbowlRuleDescription,
  LeagueRules,
  LeagueRuleWithExplanation,
} from '@shared/leagues/rules';
import datastore from '@shared/datastore';

@Resolver(() => TypeGraphQL.League)
export default class LeagueRulesResolver {
  @FieldResolver(_type => LeagueRules)
  async rules(
    @Root() league: League,
    @Ctx() {prisma: _datastore}: ApolloPrismaContext
  ): Promise<LeagueRules> {
    return await getRulesForLeague(league.league_id);
  }
}

export async function getRulesForLeague(league_id: number): Promise<LeagueRules> {
  const league = await datastore.league.findFirstOrThrow({where: {league_id}});
  const rules: LeagueRuleWithExplanation[] = [
    ...(league.late_policy
      ? [
          {
            id: `${league.league_id}-late_policy`,
            rule: 'Late Pick Policy',
            description: getLatePickPolicyDescription(league.late_policy),
          },
        ]
      : []),
    ...(league.pick_policy
      ? [
          {
            id: `${league.league_id}-pick_policy`,
            rule: 'Winner Policy',
            description: getPickPolicyDescription(league.pick_policy),
          },
        ]
      : []),
    ...(league.reminder_policy
      ? [
          {
            id: `${league.league_id}-reminder_policy`,
            rule: 'Reminders',
            description: getReminderPolicyDescription(league.reminder_policy),
          },
        ]
      : []),
    ...(league.scoring_type
      ? [
          {
            id: `${league.league_id}-scoring_type`,
            rule: 'Scoring Type',
            description: getScoringTypeDescription(league.scoring_type),
          },
        ]
      : []),
    ...(league.superbowl_competition !== null
      ? [
          {
            id: `${league.league_id}-superbowl_competition`,
            rule: 'Super Bowl Competition',
            description: getSuperbowlRuleDescription(league.superbowl_competition),
          },
        ]
      : []),
  ];
  return {
    id: league.league_id.toString(),
    rules,
  };
}
