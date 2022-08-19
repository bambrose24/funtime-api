import MakePicksResolver from "./make-picks";
import RegisterResolver from "./register";
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

// TODO figure out how to make all `datetime` MySQL columns automatically get this treatment
const modelsEnhanceMap: ModelsEnhanceMap = {
  Picks: {
    fields: {
      ts: [Field(() => DateTimeResolver)],
    },
  },
  Games: {
    fields: {
      ts: [Field(() => DateTimeResolver)],
    },
  },
  LeagueMembers: {
    fields: {
      ts: [Field(() => DateTimeResolver)],
    },
  },
  Leagues: {
    fields: {
      created_time: [Field(() => DateTimeResolver)],
    },
  },
  Superbowl: {
    fields: {
      ts: [Field(() => DateTimeResolver)],
    },
  },
  SuperbowlSquares: {
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
] as const;

export default resolvers;
