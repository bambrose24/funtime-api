"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const make_picks_1 = __importDefault(require("./make-picks"));
const register_1 = __importDefault(require("./register"));
const resolvers = [register_1.default, make_picks_1.default];
exports.default = resolvers;
