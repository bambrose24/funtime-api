"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.now = void 0;
const moment_1 = __importDefault(require("moment"));
const config_1 = require("src/config");
function now() {
    if (config_1.env === "production") {
        return (0, moment_1.default)();
    }
    return (0, moment_1.default)();
}
exports.now = now;
