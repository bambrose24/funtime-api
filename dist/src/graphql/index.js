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
graphql_scalars_1.DateTimeResolver.name = "DateTimeBetterSerialization";
const type_graphql_2 = require("@generated/type-graphql");
const type_graphql_3 = require("type-graphql");
const picksByWeek_1 = __importDefault(require("./resolvers/picksByWeek"));
const firstNotStartedWeek_1 = __importDefault(require("./resolvers/firstNotStartedWeek"));
const mostRecentStartedWeek_1 = __importDefault(require("./resolvers/mostRecentStartedWeek"));
const liveStatus_1 = __importDefault(require("./resolvers/liveStatus"));
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
const resolvers = [
    ...type_graphql_1.resolvers,
    register_1.default,
    makePicks_1.default,
    picksByWeek_1.default,
    firstNotStartedWeek_1.default,
    mostRecentStartedWeek_1.default,
    liveStatus_1.default,
];
exports.default = resolvers;
