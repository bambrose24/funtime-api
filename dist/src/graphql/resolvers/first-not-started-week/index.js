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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const datastore_1 = __importDefault(require("@shared/datastore"));
const TypeGraphQL = __importStar(require("@generated/type-graphql"));
const type_graphql_1 = require("type-graphql");
const time_1 = require("@util/time");
const register_1 = require("../register");
let FirstNotStartedWeekResponse = class FirstNotStartedWeekResponse {
    week;
    season;
    games;
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], FirstNotStartedWeekResponse.prototype, "week", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], FirstNotStartedWeekResponse.prototype, "season", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [TypeGraphQL.Game]),
    __metadata("design:type", Array)
], FirstNotStartedWeekResponse.prototype, "games", void 0);
FirstNotStartedWeekResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], FirstNotStartedWeekResponse);
let FirstNotStartedWeekRequest = class FirstNotStartedWeekRequest {
    override;
    week;
};
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Object)
], FirstNotStartedWeekRequest.prototype, "override", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], FirstNotStartedWeekRequest.prototype, "week", void 0);
FirstNotStartedWeekRequest = __decorate([
    (0, type_graphql_1.ObjectType)()
], FirstNotStartedWeekRequest);
class FirstNotStartedWeekResolver {
    async firstNotStartedWeek(data) {
        let week;
        let season;
        if (data.week && data.override) {
            week = data.week;
            season = register_1.SEASON;
        }
        else {
            const res = await findWeekForPicks();
            if (res === null) {
                return { week: null, season: null, games: [] };
            }
            week = res.week;
            season = res.season;
        }
        const games = await datastore_1.default.game.findMany({ where: { week, season } });
        return {
            week,
            season,
            games,
        };
    }
}
__decorate([
    (0, type_graphql_1.Query)(() => FirstNotStartedWeekResponse),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [FirstNotStartedWeekRequest]),
    __metadata("design:returntype", Promise)
], FirstNotStartedWeekResolver.prototype, "firstNotStartedWeek", null);
async function findWeekForPicks() {
    const gamesWithinMonth = await datastore_1.default.game.findMany({
        where: {
            ts: {
                gte: (0, time_1.now)().subtract({ months: 1 }).toDate(),
                lte: (0, time_1.now)().add({ months: 1 }).toDate(),
            },
        },
        orderBy: { ts: "asc" },
    });
    const startedWeeks = new Set();
    gamesWithinMonth.forEach((game) => {
        if (game.ts < (0, time_1.now)().toDate()) {
            startedWeeks.add(`${game.week},${game.season}`);
        }
    });
    for (let i = 0; i < gamesWithinMonth.length; i++) {
        const { week, season } = gamesWithinMonth[i];
        if (!startedWeeks.has(`${week},${season}`)) {
            return { week, season };
        }
    }
    return null;
}
exports.default = FirstNotStartedWeekResolver;
