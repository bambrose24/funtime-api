"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const express_1 = __importDefault(require("express"));
require("express-async-errors");
const jet_logger_1 = __importDefault(require("jet-logger"));
const errors_1 = require("./shared/errors");
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("@generated/type-graphql");
const type_graphql_2 = require("type-graphql");
const resolvers_1 = __importDefault(require("./graphql/resolvers"));
const datastore_1 = __importDefault(require("@shared/datastore"));
const app = (0, express_1.default)();
/************************************************************************************
 *                              Set basic express settings
 ***********************************************************************************/
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Show routes called in console during development
if (process.env.NODE_ENV === "development") {
    app.use((0, morgan_1.default)("dev"));
}
// Security
if (process.env.NODE_ENV === "production") {
    app.use((0, helmet_1.default)());
}
// Error handling
app.use((err, _, res, __) => {
    jet_logger_1.default.err(err, true);
    const status = err instanceof errors_1.CustomError ? err.HttpStatus : http_status_codes_1.default.BAD_REQUEST;
    return res.status(status).json({
        error: err.message,
    });
});
/************************************************************************************
 *                              Serve front-end content
 ***********************************************************************************/
async function bootstrap() {
    const schema = await (0, type_graphql_2.buildSchema)({
        resolvers: [...type_graphql_1.resolvers, ...resolvers_1.default],
    });
    const server = new apollo_server_express_1.ApolloServer({
        schema,
        context: () => ({ prisma: datastore_1.default }),
    });
    server.start().then(() => server.applyMiddleware({ app, path: "/graphql" }));
}
bootstrap();
/************************************************************************************
 *                              Export Server
 ***********************************************************************************/
exports.default = app;
