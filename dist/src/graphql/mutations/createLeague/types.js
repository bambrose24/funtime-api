"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateLeagueInput = void 0;
const type_graphql_1 = require("type-graphql");
const type_graphql_2 = require("@generated/type-graphql");
let CreateLeagueInput = class CreateLeagueInput {
    leagueName;
    latePolicy;
    weeklyTiebreaker;
    superbowlCompetition;
    reminderPolicy;
    pickPolicy;
    scoringType;
};
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateLeagueInput.prototype, "leagueName", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_2.LatePolicy),
    __metadata("design:type", String)
], CreateLeagueInput.prototype, "latePolicy", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], CreateLeagueInput.prototype, "weeklyTiebreaker", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], CreateLeagueInput.prototype, "superbowlCompetition", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_2.ReminderPolicy, { nullable: true }),
    __metadata("design:type", String)
], CreateLeagueInput.prototype, "reminderPolicy", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_2.PickPolicy, { nullable: true }),
    __metadata("design:type", String)
], CreateLeagueInput.prototype, "pickPolicy", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_2.ScoringType, { nullable: true }),
    __metadata("design:type", String)
], CreateLeagueInput.prototype, "scoringType", void 0);
CreateLeagueInput = __decorate([
    (0, type_graphql_1.InputType)()
], CreateLeagueInput);
exports.CreateLeagueInput = CreateLeagueInput;
