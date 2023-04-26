'use strict';
Object.defineProperty(exports, '__esModule', {value: true});
exports.env = void 0;
const configMap = {
  development: {
    port: 3001,
  },
  production: {
    port: 8080,
  },
};
let environment = 'production';
if (process.env.ENV) {
  environment = process.env.ENV;
}
console.log(`env: ${environment}`);
exports.env = environment;
exports.default = configMap[exports.env];
