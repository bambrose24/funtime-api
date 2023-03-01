import MakePicksResolver from "./mutations/makePicks";
import RegisterResolver from "./mutations/register";
import { resolvers as generatedResolvers } from "@generated/type-graphql";
import { DateTimeResolver } from "graphql-scalars";

// need to have multiple types for DateTime in our schema's scalars -- this one handles
// the redis cache better
DateTimeResolver.name = "DateTimeBetterSerialization";

import {
  ModelsEnhanceMap,
  ResolversEnhanceMap,
  applyModelsEnhanceMap,
  applyResolversEnhanceMap,
} from "@generated/type-graphql";
import { Authorized, Field } from "type-graphql";
import PicksByWeekResolver from "./queries/picksByWeek";
import FirstNotStartedWeekResolver from "./queries/firstNotStartedWeek";
import MostRecentStartedWeekResolver from "./queries/mostRecentStartedWeek";
import GameLiveResolver from "./queries/liveStatus";
import WeekWinnersResolver from "./queries/weekWinners";
import { env } from "src/config";
import { Role } from "@shared/auth/graphql";

const SHOULD_AUTH_MUTATIONS = true;

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

const userAuth = SHOULD_AUTH_MUTATIONS ? [Authorized(Role.User)] : [];
const leagueAdminAuth = SHOULD_AUTH_MUTATIONS
  ? [Authorized(Role.LeagueAdmin)]
  : [];
const sysAdminAuth = SHOULD_AUTH_MUTATIONS ? [Authorized(Role.SysAdmin)] : [];

const resolversEnhancedMap: ResolversEnhanceMap = {
  Game: {
    createManyGame: sysAdminAuth,
    createOneGame: sysAdminAuth,
    deleteManyGame: sysAdminAuth,
    deleteOneGame: sysAdminAuth,
    updateManyGame: sysAdminAuth,
    updateOneGame: sysAdminAuth,
    upsertOneGame: sysAdminAuth,
  },
  League: {
    createManyLeague: sysAdminAuth,
    createOneLeague: sysAdminAuth,
    updateManyLeague: sysAdminAuth,
    updateOneLeague: sysAdminAuth,
    upsertOneLeague: sysAdminAuth,
    deleteManyLeague: sysAdminAuth,
    deleteOneLeague: sysAdminAuth,
  },
  LeagueMember: {
    createManyLeagueMember: sysAdminAuth,
    createOneLeagueMember: sysAdminAuth,
    updateManyLeagueMember: sysAdminAuth,
    updateOneLeagueMember: sysAdminAuth,
    upsertOneLeagueMember: sysAdminAuth,
    deleteManyLeagueMember: sysAdminAuth,
    deleteOneLeagueMember: sysAdminAuth,
  },
  Pick: {
    createManyPick: sysAdminAuth,
    createOnePick: sysAdminAuth,
    deleteManyPick: sysAdminAuth,
    deleteOnePick: sysAdminAuth,
    updateManyPick: sysAdminAuth,
    updateOnePick: sysAdminAuth,
    upsertOnePick: sysAdminAuth,
  },
  Superbowl: {
    createManySuperbowl: sysAdminAuth,
    createOneSuperbowl: sysAdminAuth,
    deleteManySuperbowl: sysAdminAuth,
    deleteOneSuperbowl: sysAdminAuth,
    updateManySuperbowl: sysAdminAuth,
    updateOneSuperbowl: sysAdminAuth,
    upsertOneSuperbowl: sysAdminAuth,
  },
  SuperbowlSquare: {
    createManySuperbowlSquare: sysAdminAuth,
    createOneSuperbowlSquare: sysAdminAuth,
    deleteManySuperbowlSquare: sysAdminAuth,
    deleteOneSuperbowlSquare: sysAdminAuth,
    updateManySuperbowlSquare: sysAdminAuth,
    updateOneSuperbowlSquare: sysAdminAuth,
    upsertOneSuperbowlSquare: sysAdminAuth,
  },
  Team: {
    createManyTeam: sysAdminAuth,
    createOneTeam: sysAdminAuth,
    deleteManyTeam: sysAdminAuth,
    deleteOneTeam: sysAdminAuth,
    updateManyTeam: sysAdminAuth,
    updateOneTeam: sysAdminAuth,
    upsertOneTeam: sysAdminAuth,
  },
  User: {
    findFirstUser: sysAdminAuth,
    createManyUser: sysAdminAuth,
    createOneUser: sysAdminAuth,
    deleteManyUser: sysAdminAuth,
    deleteOneUser: sysAdminAuth,
    updateManyUser: sysAdminAuth,
    updateOneUser: sysAdminAuth,
    upsertOneUser: sysAdminAuth,
  },
};

applyResolversEnhanceMap(resolversEnhancedMap);

const resolvers = [
  ...generatedResolvers,
  RegisterResolver,
  MakePicksResolver,
  PicksByWeekResolver,
  FirstNotStartedWeekResolver,
  MostRecentStartedWeekResolver,
  GameLiveResolver,
  WeekWinnersResolver,
] as const;

export default resolvers;
