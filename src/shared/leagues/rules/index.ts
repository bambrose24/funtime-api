import {LatePolicy, PickPolicy, ReminderPolicy, ScoringType} from '@prisma/client';
import {Field, ID, ObjectType} from 'type-graphql';

@ObjectType('LeagueRuleWithExplanation')
export class LeagueRuleWithExplanation {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;
}

export function getLatePickPolicyDescription(policy: LatePolicy): string {
  switch (policy) {
    case LatePolicy.allow_late_whole_week:
      return `You can make picks through the end of the week, except for games that have started.`;
    case LatePolicy.close_at_first_game_start:
      return `As soon as the first game of the week starts, you cannot make any picks.`;
    case LatePolicy.allow_late_and_lock_after_start:
      return `If you're late, it's ok, you can pick games that haven't started. But when the week starts, picks are not editable and all picks are revealed to people who have made them.`;
  }
}

export function getPickPolicyDescription(policy: PickPolicy): string {
  switch (policy) {
    case PickPolicy.choose_winner:
      return `Choose who you think will win, regardless of odds.`;
  }
}

export function getReminderPolicyDescription(policy: ReminderPolicy): string {
  switch (policy) {
    case ReminderPolicy.three_hours_before:
      return `You will be reminded 3 hours before the first game of the week if you haven't submitted picks yet.`;
  }
}

export function getScoringTypeDescription(scoringType: ScoringType): string {
  switch (scoringType) {
    case ScoringType.game_winner:
      return `The person with the most correct picks wins.`;
  }
}

export function getSuperbowlRuleDescription(superbowl: boolean): string {
  if (superbowl) {
    return `To register, you must pick who you think will play in the Super Bowl, along with a total score for that game. This is a fun contest that plays out after the regular season.`;
  }
  return `There is no Super Bowl competition set up for this league.`;
}
