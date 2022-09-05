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
exports.DEFAULT_ROLE = exports.LEAGUE_ID = exports.SEASON = void 0;
const datastore_1 = __importDefault(require("@shared/datastore"));
const type_graphql_1 = require("type-graphql");
const TypeGraphQL = __importStar(require("@generated/type-graphql"));
const email_1 = require("@shared/email");
exports.SEASON = 2022;
exports.LEAGUE_ID = 7;
exports.DEFAULT_ROLE = "player";
let RegisterResponse = class RegisterResponse {
    success;
    user;
    membership;
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Boolean)
], RegisterResponse.prototype, "success", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => TypeGraphQL.People),
    __metadata("design:type", Object)
], RegisterResponse.prototype, "user", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => TypeGraphQL.LeagueMembers),
    __metadata("design:type", Object)
], RegisterResponse.prototype, "membership", void 0);
RegisterResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], RegisterResponse);
let RegisterResolver = class RegisterResolver {
    async register(email, username, previousUserId, superbowlWinner, superbowlLoser, superbowlScore) {
        const { user, membership } = await registerUser(email, username, previousUserId);
        await upsertSuperbowlPick(user, membership, superbowlWinner, superbowlLoser, superbowlScore);
        try {
            await (0, email_1.sendRegistrationMail)(username, email, exports.SEASON, superbowlWinner, superbowlLoser, superbowlScore);
        }
        catch (e) {
            console.log("email error:", e);
        }
        return { success: true, user, membership };
    }
};
__decorate([
    (0, type_graphql_1.Mutation)(() => RegisterResponse),
    __param(0, (0, type_graphql_1.Arg)("email")),
    __param(1, (0, type_graphql_1.Arg)("username")),
    __param(2, (0, type_graphql_1.Arg)("previousUserId", () => type_graphql_1.Int, { nullable: true })),
    __param(3, (0, type_graphql_1.Arg)("superbowlWinner", () => type_graphql_1.Int)),
    __param(4, (0, type_graphql_1.Arg)("superbowlLoser", () => type_graphql_1.Int)),
    __param(5, (0, type_graphql_1.Arg)("superbowlScore", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], RegisterResolver.prototype, "register", null);
RegisterResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], RegisterResolver);
async function upsertSuperbowlPick(user, membership, superbowlWinner, superbowlLoser, superbowlScore) {
    const currentSuperbowlPick = await datastore_1.default.superbowl.findFirst({
        where: {
            member_id: { equals: membership.membership_id },
        },
    });
    if (currentSuperbowlPick) {
        await datastore_1.default.superbowl.update({
            where: {
                pickid: currentSuperbowlPick.pickid,
            },
            data: {
                uid: user.uid,
                winner: superbowlWinner,
                loser: superbowlLoser,
                score: superbowlScore,
                member_id: membership.membership_id,
            },
        });
        return;
    }
    await datastore_1.default.superbowl.create({
        data: {
            uid: user.uid,
            winner: superbowlWinner,
            loser: superbowlLoser,
            score: superbowlScore,
            member_id: membership.membership_id,
        },
    });
}
async function registerUser(email, username, previousUserId) {
    let user = null;
    let membership = null;
    // see if user already exists for this season
    user = await datastore_1.default.user.findFirst({
        where: { email: email, season: { gte: 2021 } },
    });
    if (user) {
        membership = await datastore_1.default.leagueMember.findFirst({
            where: { user_id: user.uid, league_id: exports.LEAGUE_ID },
        });
        if (membership) {
            return { user, membership };
        }
    }
    if (previousUserId) {
        user = await datastore_1.default.user.findUnique({
            where: { uid: previousUserId },
        });
        if (!user) {
            throw new Error(`Could not find a user with previous ID ${previousUserId}`);
        }
    }
    else {
        user = await datastore_1.default.user.findFirst({
            where: {
                email,
                season: 2021,
            },
        });
        if (!user) {
            user = await datastore_1.default.user.create({
                data: {
                    username,
                    email,
                    season: 2022,
                    fname: "",
                    lname: "",
                },
            });
        }
        if (!user) {
            throw new Error(`Error creating a new user`);
        }
    }
    membership = await datastore_1.default.leagueMember.create({
        data: {
            league_id: exports.LEAGUE_ID,
            user_id: user.uid,
            role: exports.DEFAULT_ROLE,
        },
    });
    return { user, membership };
}
exports.default = RegisterResolver;
