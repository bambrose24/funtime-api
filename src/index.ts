import "module-alias/register";
import "reflect-metadata";
import logger from "jet-logger";
import server from "./server";
import config from "./config";

const port = config.port || 3000;
const serverStartMsg = `Express server started on port: ${port} (node version ${process.version})`;

// Start server
server.listen(port, () => {
  logger.info(serverStartMsg);
});
