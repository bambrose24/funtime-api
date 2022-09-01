/* eslint-disable @typescript-eslint/no-unsafe-argument */
if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  require("dotenv").config();
}
import { getGamesBySeason, getGamesByWeek } from "../shared/mysportsfeeds";

async function run() {
  const games = await getGamesByWeek(2022, 1);
  console.log(games[0]);
}

run();
