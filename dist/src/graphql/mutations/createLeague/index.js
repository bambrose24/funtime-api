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
exports.CreateLeagueMutation = void 0;
const type_graphql_1 = require("type-graphql");
const TypeGraphQL = __importStar(require("@generated/type-graphql"));
const types_1 = require("./types");
const datastore_1 = __importDefault(require("@shared/datastore"));
const const_1 = require("@util/const");
const user_1 = require("@shared/auth/user");
const nanoid_1 = require("nanoid");
let CreateLeagueMutation = class CreateLeagueMutation {
    async createLeague(data) {
        const { dbUser } = (0, user_1.getUser)() ?? {};
        if (!dbUser) {
            throw new Error(`Must be logged in to create a league`);
        }
        const uid = dbUser.uid;
        const league = await datastore_1.default.league.create({
            data: {
                name: data.leagueName,
                season: const_1.SEASON,
                created_by_user_id: uid,
                share_code: (0, nanoid_1.nanoid)(),
                superbowl_competition: data.superbowlCompetition,
                late_policy: data.latePolicy,
                pick_policy: data.pickPolicy,
                reminder_policy: data.reminderPolicy,
                scoring_type: data.scoringType,
            },
        });
        const _membership = await datastore_1.default.leagueMember.create({
            data: {
                role: 'admin',
                league_id: league.league_id,
                user_id: uid,
            },
        });
        return league;
    }
};
__decorate([
    (0, type_graphql_1.Mutation)(() => TypeGraphQL.League),
    __param(0, (0, type_graphql_1.Arg)('data', () => types_1.CreateLeagueInput)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [types_1.CreateLeagueInput]),
    __metadata("design:returntype", Promise)
], CreateLeagueMutation.prototype, "createLeague", null);
CreateLeagueMutation = __decorate([
    (0, type_graphql_1.Resolver)()
], CreateLeagueMutation);
exports.CreateLeagueMutation = CreateLeagueMutation;
