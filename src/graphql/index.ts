import MakePicksResolver from "./mutations/makePicks";
import RegisterResolver from "./mutations/register";
import { resolvers as generatedResolvers } from "@generated/type-graphql";
import { DateTimeResolver } from "graphql-scalars";

// need to have multiple types for DateTime in our schema's scalars -- this one handles
// the redis cache better
DateTimeResolver.name = "DateTimeBetterSerialization";

import {
  ModelsEnhanceMap,
  applyModelsEnhanceMap,
} from "@generated/type-graphql";
import { Field } from "type-graphql";
import PicksByWeekResolver from "./queries/picksByWeek";
import FirstNotStartedWeekResolver from "./queries/firstNotStartedWeek";
import MostRecentStartedWeekResolver from "./queries/mostRecentStartedWeek";
import GameLiveResolver from "./queries/liveStatus";
// TODO figure out how to make all `datetime` MySQL columns automatically get this treatment
const modelsEnhanceMap: ModelsEnhanceMap = {
  Pick: {
    fields: {
      ts: [Field(() => DateTimeResolver)],
    },
  },
  Game: {
    fields: {
      ts: [Field(() => DateTimeResolver)],
    },
  },
  LeagueMember: {
    fields: {
      ts: [Field(() => DateTimeResolver)],
    },
  },
  League: {
    fields: {
      created_time: [Field(() => DateTimeResolver)],
    },
  },
  Superbowl: {
    fields: {
      ts: [Field(() => DateTimeResolver)],
    },
  },
  SuperbowlSquare: {
    fields: {
      ts: [Field(() => DateTimeResolver)],
    },
  },
};

applyModelsEnhanceMap(modelsEnhanceMap);

const resolvers = [
  ...generatedResolvers,
  RegisterResolver,
  MakePicksResolver,
  PicksByWeekResolver,
  FirstNotStartedWeekResolver,
  MostRecentStartedWeekResolver,
  GameLiveResolver,
] as const;

export default resolvers;
