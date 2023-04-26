'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
Object.defineProperty(exports, '__esModule', {value: true});
exports.getToken = exports.setToken = exports.getUser = exports.setUser = void 0;
const express_http_context_1 = __importDefault(require('express-http-context'));
const USER_CONTEXT_KEY = 'funtime_user';
const TOKEN_CONTEXT_KEY = 'funtime_token';
function setUser(user) {
  express_http_context_1.default.set(USER_CONTEXT_KEY, user);
}
exports.setUser = setUser;
function getUser() {
  return express_http_context_1.default.get(USER_CONTEXT_KEY);
}
exports.getUser = getUser;
function setToken(token) {
  express_http_context_1.default.set(TOKEN_CONTEXT_KEY, token);
}
exports.setToken = setToken;
function getToken() {
  return express_http_context_1.default.get(TOKEN_CONTEXT_KEY);
}
exports.getToken = getToken;
