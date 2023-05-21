import {Field, Int, ObjectType} from 'type-graphql';

@ObjectType()
export class AggregateResponse {
  @Field(_type => Int)
  count: number;
}
