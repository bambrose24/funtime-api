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
const type_graphql_1 = require("type-graphql");
const TypeGraphQL = __importStar(require("@generated/type-graphql"));
const datastore_1 = __importDefault(require("@shared/datastore"));
const winner_1 = require("@shared/winner");
let WeekWinner = class WeekWinner {
    member;
    week;
    correct;
    score_diff;
};
__decorate([
    (0, type_graphql_1.Field)(() => [TypeGraphQL.LeagueMember]),
    __metadata("design:type", Object)
], WeekWinner.prototype, "member", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], WeekWinner.prototype, "week", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], WeekWinner.prototype, "correct", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], WeekWinner.prototype, "score_diff", void 0);
WeekWinner = __decorate([
    (0, type_graphql_1.ObjectType)()
], WeekWinner);
class WeekWinnersResolver {
    async weekWinners(league_id, season, weeks) {
        const members = await datastore_1.default.leagueMember.findMany({
            where: { league_id },
        });
        const picks = await datastore_1.default.pick.findMany({
            where: {
                leaguemembers: { league_id },
                ...(weeks ? { week: { in: weeks } } : {}),
                ...(season ? { season } : {}),
            },
        });
        const league = await datastore_1.default.league.findUnique({ where: { league_id } });
        const games = await datastore_1.default.game.findMany({
            where: {
                ...(season
                    ? { season }
                    : league && league.season
                        ? { season: league.season }
                        : {}),
                ...(weeks ? { week: { in: weeks } } : {}),
            },
        });
        const winners = await (0, winner_1.calculateWinnersFromDonePicks)(league_id, picks, games);
        return winners
            .filter((winner) => winner.member_ids && winner.member_ids.length > 0)
            .map((winner) => {
            return {
                member: members.filter((m) => winner.member_ids?.includes(m.membership_id)),
                week: winner.week,
                correct: winner.num_correct || 0,
                score_diff: winner.score_diff || 0,
            };
        });
    }
}
__decorate([
    (0, type_graphql_1.Query)(() => [WeekWinner]),
    __param(0, (0, type_graphql_1.Arg)("league_id", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)("season", () => type_graphql_1.Int, { nullable: true })),
    __param(2, (0, type_graphql_1.Arg)("weeks", () => [type_graphql_1.Int], { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], WeekWinnersResolver.prototype, "weekWinners", null);
exports.default = WeekWinnersResolver;
