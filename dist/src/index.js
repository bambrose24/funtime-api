"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
require("reflect-metadata");
const jet_logger_1 = __importDefault(require("jet-logger"));
const server_1 = __importDefault(require("./server"));
const config_1 = __importDefault(require("./config"));
const port = config_1.default.port || 3000;
const serverStartMsg = `🚀 Express server started on port: ${port} (node version ${process.version})`;
// Start server
server_1.default.listen(port, () => {
    jet_logger_1.default.info(serverStartMsg);
});
