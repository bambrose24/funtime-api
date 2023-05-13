"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const configMap = {
    development: {
        port: 3001,
    },
    staging: {
        port: 8080,
    },
    production: {
        port: 8080,
    },
};
let environment = 'production';
if (process.env.FUNTIME_ENV) {
    environment = process.env.FUNTIME_ENV;
}
console.log(`env: ${environment}`);
exports.env = environment;
const config = configMap[exports.env];
exports.default = config;
