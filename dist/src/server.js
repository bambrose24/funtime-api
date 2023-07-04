"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const node_cron_1 = __importDefault(require("node-cron"));
require("express-async-errors");
const jet_logger_1 = __importDefault(require("jet-logger"));
const express_http_context_1 = __importDefault(require("express-http-context"));
const errors_1 = require("./shared/errors");
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const type_graphql_1 = require("type-graphql");
const graphql_1 = __importDefault(require("./graphql"));
const keepThingsUpdated_1 = __importDefault(require("./cron/keepThingsUpdated"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const auth_1 = require("@shared/auth");
const graphql_2 = require("@shared/auth/graphql");
const datastore_1 = __importDefault(require("@shared/datastore"));
const app = (0, express_1.default)();
/************************************************************************************
 *                              Set basic express settings
 ***********************************************************************************/
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Show routes called in console during development
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
// Security
if (process.env.NODE_ENV === 'production') {
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
app.use((0, cors_1.default)());
app.use(express_http_context_1.default.middleware);
app.use(async (req, res, next) => {
    const bearerToken = req.get('Authorization');
    if (bearerToken) {
        const token = bearerToken.split(' ').at(1);
        if (token) {
            await (0, auth_1.authorizeAndSetSupabaseUser)(token);
        }
    }
    next();
});
// keepThingsUpdated();
// Run the 3 minute cron
if (config_1.env === 'production') {
    node_cron_1.default.schedule('*/3 * * * *', async () => {
        await (0, keepThingsUpdated_1.default)();
    });
}
async function bootstrap() {
    const schema = await (0, type_graphql_1.buildSchema)({
        resolvers: graphql_1.default,
        dateScalarMode: 'isoDate',
        authChecker: graphql_2.customAuthChecker,
    });
    // TODO consider pulling the server into a different file for creation
    const server = new server_1.ApolloServer({
        schema,
        introspection: config_1.env !== 'production',
        // Need to figure out how to clear the cache after mutations
        // cache: new KeyvAdapter(new Keyv(process.env.REDIS_URL)),
    });
    await server.start();
    app.use('/graphql', (0, cors_1.default)(), (0, body_parser_1.json)(), (0, express4_1.expressMiddleware)(server, {
        context: async ({ req: _req }) => {
            return { prisma: datastore_1.default };
        },
    }));
}
bootstrap();
/************************************************************************************
 *                              Export Server
 ***********************************************************************************/
exports.default = app;
