"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const makePicks_1 = __importDefault(require("./mutations/makePicks"));
const register_1 = __importDefault(require("./mutations/register"));
const type_graphql_1 = require("@generated/type-graphql");
const graphql_scalars_1 = require("graphql-scalars");
// need to have multiple types for DateTime in our schema's scalars -- this one handles
// the redis cache better
graphql_scalars_1.DateTimeResolver.name = 'DateTimeBetterSerialization';
const type_graphql_2 = require("@generated/type-graphql");
const type_graphql_3 = require("type-graphql");
const picksByWeek_1 = __importDefault(require("./queries/picksByWeek"));
const firstNotStartedWeek_1 = __importDefault(require("./queries/firstNotStartedWeek"));
const mostRecentStartedWeek_1 = __importDefault(require("./queries/mostRecentStartedWeek"));
const liveStatus_1 = __importDefault(require("./queries/liveStatus"));
const graphql_1 = require("@shared/auth/graphql");
const leagueMemberPickAggregate_1 = __importDefault(require("./queries/leagueMember/leagueMemberPickAggregate"));
const me_1 = __importDefault(require("./queries/me"));
const games_1 = __importDefault(require("./queries/league/games"));
const id_1 = __importDefault(require("./queries/league/id"));
const id_2 = __importDefault(require("./queries/game/id"));
const id_3 = __importDefault(require("./queries/pick/id"));
const id_4 = __importDefault(require("./queries/leagueMember/id"));
const id_5 = __importDefault(require("./queries/superbowl/id"));
const id_6 = __importDefault(require("./queries/superbowlSquare/id"));
const id_7 = __importDefault(require("./queries/team/id"));
const id_8 = __importDefault(require("./queries/user/id"));
const createLeague_1 = require("./mutations/createLeague");
const SHOULD_AUTH_MUTATIONS = true;
// TODO figure out how to make all `datetime` MySQL columns automatically get this treatment
const modelsEnhanceMap = {
    Pick: {
        fields: {
            ts: [(0, type_graphql_3.Field)(() => graphql_scalars_1.DateTimeResolver)],
        },
    },
    Game: {
        fields: {
            ts: [(0, type_graphql_3.Field)(() => graphql_scalars_1.DateTimeResolver)],
        },
    },
    LeagueMember: {
        fields: {
            ts: [(0, type_graphql_3.Field)(() => graphql_scalars_1.DateTimeResolver)],
        },
    },
    League: {
        fields: {
            created_time: [(0, type_graphql_3.Field)(() => graphql_scalars_1.DateTimeResolver)],
        },
    },
    Superbowl: {
        fields: {
            ts: [(0, type_graphql_3.Field)(() => graphql_scalars_1.DateTimeResolver)],
        },
    },
    SuperbowlSquare: {
        fields: {
            ts: [(0, type_graphql_3.Field)(() => graphql_scalars_1.DateTimeResolver)],
        },
    },
};
(0, type_graphql_2.applyModelsEnhanceMap)(modelsEnhanceMap);
const userAuth = SHOULD_AUTH_MUTATIONS ? [(0, type_graphql_3.Authorized)(graphql_1.Role.User)] : [];
const leagueAdminAuth = SHOULD_AUTH_MUTATIONS ? [(0, type_graphql_3.Authorized)(graphql_1.Role.LeagueAdmin)] : [];
const sysAdminAuth = SHOULD_AUTH_MUTATIONS ? [(0, type_graphql_3.Authorized)(graphql_1.Role.SysAdmin)] : [];
const Middlware = async ({ context }, next) => { };
const resolversEnhancedMap = {
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
(0, type_graphql_2.applyResolversEnhanceMap)(resolversEnhancedMap);
const idResolvers = [
    id_1.default,
    id_2.default,
    id_3.default,
    id_4.default,
    id_5.default,
    id_6.default,
    id_7.default,
    id_8.default,
];
const resolvers = [
    ...type_graphql_1.resolvers,
    ...idResolvers,
    register_1.default,
    makePicks_1.default,
    picksByWeek_1.default,
    firstNotStartedWeek_1.default,
    mostRecentStartedWeek_1.default,
    liveStatus_1.default,
    leagueMemberPickAggregate_1.default,
    games_1.default,
    me_1.default,
    createLeague_1.CreateLeagueMutation,
];
exports.default = resolvers;
