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
const getNextGame_1 = require("@shared/queries/getNextGame");
const datastore_1 = __importDefault(require("@shared/datastore"));
let LeagueMemberID = class LeagueMemberID {
    async id(leagueMember) {
        return leagueMember.membership_id.toString();
    }
    async nextGame(_leagueMember) {
        return await (0, getNextGame_1.getNextGame)();
    }
    async hasPickedNextGame(leagueMember) {
        const nextGame = await (0, getNextGame_1.getNextGame)();
        if (!nextGame) {
            return true;
        }
        const pick = await datastore_1.default.pick.findFirst({
            where: { member_id: leagueMember.membership_id, gid: nextGame.gid },
        });
        return Boolean(pick);
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(_type => type_graphql_1.ID),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LeagueMemberID.prototype, "id", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(_type => TypeGraphQL.Game, { nullable: true }),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LeagueMemberID.prototype, "nextGame", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(_type => Boolean),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LeagueMemberID.prototype, "hasPickedNextGame", null);
LeagueMemberID = __decorate([
    (0, type_graphql_1.Resolver)(() => TypeGraphQL.LeagueMember)
], LeagueMemberID);
exports.default = LeagueMemberID;
