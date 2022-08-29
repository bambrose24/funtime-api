"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const make_picks_1 = __importDefault(require("./make-picks"));
const register_1 = __importDefault(require("./register"));
const type_graphql_1 = require("@generated/type-graphql");
const graphql_scalars_1 = require("graphql-scalars");
// need to have multiple types for DateTime in our schema's scalars -- this one handles
// the redis cache better
graphql_scalars_1.DateTimeResolver.name = "DateTimeBetterSerialization";
const type_graphql_2 = require("@generated/type-graphql");
const type_graphql_3 = require("type-graphql");
const picks_by_week_1 = __importDefault(require("./picks-by-week"));
const first_not_started_week_1 = __importDefault(require("./first-not-started-week"));
const most_recent_started_week_1 = __importDefault(require("./most-recent-started-week"));
// TODO figure out how to make all `datetime` MySQL columns automatically get this treatment
const modelsEnhanceMap = {
    Picks: {
        fields: {
            ts: [(0, type_graphql_3.Field)(() => graphql_scalars_1.DateTimeResolver)],
        },
    },
    Games: {
        fields: {
            ts: [(0, type_graphql_3.Field)(() => graphql_scalars_1.DateTimeResolver)],
        },
    },
    LeagueMembers: {
        fields: {
            ts: [(0, type_graphql_3.Field)(() => graphql_scalars_1.DateTimeResolver)],
        },
    },
    Leagues: {
        fields: {
            created_time: [(0, type_graphql_3.Field)(() => graphql_scalars_1.DateTimeResolver)],
        },
    },
    Superbowl: {
        fields: {
            ts: [(0, type_graphql_3.Field)(() => graphql_scalars_1.DateTimeResolver)],
        },
    },
    SuperbowlSquares: {
        fields: {
            ts: [(0, type_graphql_3.Field)(() => graphql_scalars_1.DateTimeResolver)],
        },
    },
};
(0, type_graphql_2.applyModelsEnhanceMap)(modelsEnhanceMap);
const resolvers = [
    ...type_graphql_1.resolvers,
    register_1.default,
    make_picks_1.default,
    picks_by_week_1.default,
    first_not_started_week_1.default,
    most_recent_started_week_1.default,
];
exports.default = resolvers;
