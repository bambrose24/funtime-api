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
let PickAggregateResponse = class PickAggregateResponse {
    count;
};
__decorate([
    (0, type_graphql_1.Field)(_type => type_graphql_1.Int),
    __metadata("design:type", Number)
], PickAggregateResponse.prototype, "count", void 0);
PickAggregateResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], PickAggregateResponse);
let LeagueMemberPickAggregateResolver = class LeagueMemberPickAggregateResolver {
    async aggregatePick(member, { prisma: datastore }, where) {
        console.log('hiiii', where);
        const res = await datastore.pick.aggregate({
            _count: { pickid: true },
            where: { ...where, member_id: member.membership_id },
        });
        return { count: res._count.pickid };
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(_type => PickAggregateResponse),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __param(2, (0, type_graphql_1.Arg)('where', _type => TypeGraphQL.PickWhereInput, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], LeagueMemberPickAggregateResolver.prototype, "aggregatePick", null);
LeagueMemberPickAggregateResolver = __decorate([
    (0, type_graphql_1.Resolver)(() => TypeGraphQL.LeagueMember)
], LeagueMemberPickAggregateResolver);
exports.default = LeagueMemberPickAggregateResolver;
