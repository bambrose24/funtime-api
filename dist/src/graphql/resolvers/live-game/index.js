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
Object.defineProperty(exports, "__esModule", { value: true });
const type_graphql_1 = require("type-graphql");
const TypeGraphQL = __importStar(require("@generated/type-graphql"));
const mysportsfeeds_1 = require("../../../shared/mysportsfeeds");
const types_1 = require("../../../shared/mysportsfeeds/types");
let GameLive = class GameLive {
    currentQuarter;
    currentQuarterSecondsRemaining;
    playedStatus;
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], GameLive.prototype, "currentQuarter", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], GameLive.prototype, "currentQuarterSecondsRemaining", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => types_1.MSFGamePlayedStatus, { nullable: true }),
    __metadata("design:type", Object)
], GameLive.prototype, "playedStatus", void 0);
GameLive = __decorate([
    (0, type_graphql_1.ObjectType)("GameLive")
], GameLive);
let GameLiveResolver = class GameLiveResolver {
    async liveStatus(game, { prisma: datastore }) {
        const [teams, msfGames] = await Promise.all([
            datastore.teams.findMany({ where: { teamid: { gt: 0 } } }),
            (0, mysportsfeeds_1.getGamesByWeek)(game.season, game.week),
        ]);
        const homeTeam = teams.find((t) => t.teamid === game.home);
        const awayTeam = teams.find((t) => t.teamid === game.away);
        const msfGame = msfGames.find((g) => g.schedule.homeTeam.abbreviation === homeTeam.abbrev &&
            g.schedule.awayTeam.abbreviation === awayTeam.abbrev);
        if (!msfGame) {
            return null;
        }
        return {
            currentQuarter: msfGame.score.currentQuarter,
            currentQuarterSecondsRemaining: msfGame.score.currentQuarterSecondsRemaining,
            playedStatus: msfGame.schedule.playedStatus,
        };
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)((_type) => GameLive, { nullable: true }),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GameLiveResolver.prototype, "liveStatus", null);
GameLiveResolver = __decorate([
    (0, type_graphql_1.Resolver)(() => TypeGraphQL.Games)
], GameLiveResolver);
exports.default = GameLiveResolver;
