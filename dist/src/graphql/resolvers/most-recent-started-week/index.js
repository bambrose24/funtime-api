"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const datastore_1 = __importDefault(require("@shared/datastore"));
const TypeGraphQL = __importStar(require("@generated/type-graphql"));
const type_graphql_1 = require("type-graphql");
const time_1 = require("@util/time");
const moment_1 = __importDefault(require("moment"));
let MostRecentStartedWeekResponse = class MostRecentStartedWeekResponse {
    week;
    season;
    picks;
    games;
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], MostRecentStartedWeekResponse.prototype, "week", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], MostRecentStartedWeekResponse.prototype, "season", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [TypeGraphQL.Picks]),
    __metadata("design:type", Array)
], MostRecentStartedWeekResponse.prototype, "picks", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [TypeGraphQL.Games]),
    __metadata("design:type", Array)
], MostRecentStartedWeekResponse.prototype, "games", void 0);
MostRecentStartedWeekResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], MostRecentStartedWeekResponse);
class MostRecentStartedWeekResolver {
    async mostRecentStartedWeek(league_id) {
        const mostRecentStartedGame = await datastore_1.default.game.findFirst({
            where: {
                ts: { lte: (0, time_1.now)().toDate() },
            },
            orderBy: { ts: "desc" },
        });
        console.log(mostRecentStartedGame, (0, time_1.now)(), (0, moment_1.default)());
        if (!mostRecentStartedGame) {
            throw new Error("No games have ts before right now");
        }
        const { week, season } = mostRecentStartedGame;
        const [games, picks] = await Promise.all([
            datastore_1.default.game.findMany({ where: { week, season } }),
            datastore_1.default.pick.findMany({
                where: { week, leaguemembers: { league_id } },
            }),
        ]);
        return {
            week,
            season,
            picks,
            games,
        };
    }
}
__decorate([
    (0, type_graphql_1.Query)(() => MostRecentStartedWeekResponse),
    __param(0, (0, type_graphql_1.Arg)("league_id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MostRecentStartedWeekResolver.prototype, "mostRecentStartedWeek", null);
exports.default = MostRecentStartedWeekResolver;
