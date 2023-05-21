import {Field, InputType} from 'type-graphql';
import {LatePolicy, ReminderPolicy, PickPolicy, ScoringType} from '@generated/type-graphql';

@InputType()
export class CreateLeagueInput {
  @Field(() => String)
  leagueName: string;

  @Field(() => LatePolicy)
  latePolicy: LatePolicy;

  @Field(() => Boolean)
  weeklyTiebreaker: boolean;

  @Field(() => Boolean)
  superbowlCompetition: boolean;

  @Field(() => ReminderPolicy, {nullable: true})
  reminderPolicy: ReminderPolicy;

  @Field(() => PickPolicy, {nullable: true})
  pickPolicy: PickPolicy;

  @Field(() => ScoringType, {nullable: true})
  scoringType: ScoringType;
}
