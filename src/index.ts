import "module-alias/register";
import "reflect-metadata";
import logger from "jet-logger";
import server from "./server";
import config from "./config";

// Constants
const serverStartMsg = "Express server started on port: ",
  port = config.port || 3000;

// Start server
server.listen(port, () => {
  logger.info(serverStartMsg + port);
});
