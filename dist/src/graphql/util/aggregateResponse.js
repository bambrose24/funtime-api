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
exports.AggregateResponse = void 0;
const type_graphql_1 = require("type-graphql");
let AggregateResponse = class AggregateResponse {
    count;
};
__decorate([
    (0, type_graphql_1.Field)(_type => type_graphql_1.Int),
    __metadata("design:type", Number)
], AggregateResponse.prototype, "count", void 0);
AggregateResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], AggregateResponse);
exports.AggregateResponse = AggregateResponse;
