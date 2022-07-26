"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const register_1 = require("./register");
const resolvers = {
    Query: {},
    Mutation: {
        register: register_1.register,
    },
};
exports.default = resolvers;
