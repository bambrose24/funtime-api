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
const moment_1 = __importDefault(require("moment"));
const TypeGraphQL = __importStar(require("@generated/type-graphql"));
const type_graphql_1 = require("type-graphql");
const time_1 = require("@util/time");
let PicksByWeekResponse = class PicksByWeekResponse {
    week;
    season;
    canView;
    picks;
    games;
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], PicksByWeekResponse.prototype, "week", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], PicksByWeekResponse.prototype, "season", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Boolean)
], PicksByWeekResponse.prototype, "canView", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [TypeGraphQL.Pick]),
    __metadata("design:type", Array)
], PicksByWeekResponse.prototype, "picks", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [TypeGraphQL.Game]),
    __metadata("design:type", Array)
], PicksByWeekResponse.prototype, "games", void 0);
PicksByWeekResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], PicksByWeekResponse);
class PicksByWeekResolver {
    async picksByWeek(league_id, week, override) {
        const league = await datastore_1.default.league.findFirst({
            where: { league_id: { equals: league_id } },
        });
        const season = league?.season;
        if (!season) {
            throw new Error(`could not find season from league_id ${league_id}`);
        }
        let games;
        const whereInput = {};
        if (week) {
            whereInput["week"] = { equals: week };
            whereInput["season"] = { equals: season };
            games = await datastore_1.default.game.findMany({
                where: {
                    week: { equals: week },
                    season: { equals: season },
                },
                orderBy: { ts: "asc" },
            });
        }
        else {
            const lastStartedGame = await datastore_1.default.game.findFirst({
                where: {
                    ts: { lte: (0, time_1.now)().toDate() },
                    season: { equals: season },
                },
                orderBy: { ts: "desc" },
            });
            if (!lastStartedGame) {
                games = [];
            }
            else {
                games = await datastore_1.default.game.findMany({
                    where: {
                        week: { equals: lastStartedGame.week },
                        season: { equals: lastStartedGame.season },
                    },
                    orderBy: { ts: "asc" },
                });
            }
        }
        if (!games || games.length === 0) {
            return {
                week,
                season,
                canView: override || false,
                picks: [],
                games: [],
            };
        }
        const { week: realWeek, season: realSeason } = games[0];
        const canView = games[0].ts < (0, moment_1.default)().toDate();
        const picks = await datastore_1.default.pick.findMany({
            where: {
                week: { equals: realWeek },
                season: { equals: realSeason },
                leaguemembers: {
                    league_id: { equals: league_id },
                },
            },
        });
        return {
            week: realWeek,
            season: realSeason,
            canView: override || canView,
            picks,
            games,
        };
    }
}
__decorate([
    (0, type_graphql_1.Query)(() => PicksByWeekResponse),
    __param(0, (0, type_graphql_1.Arg)("league_id", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)("week", () => type_graphql_1.Int, { nullable: true })),
    __param(2, (0, type_graphql_1.Arg)("override", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Boolean]),
    __metadata("design:returntype", Promise)
], PicksByWeekResolver.prototype, "picksByWeek", null);
exports.default = PicksByWeekResolver;
