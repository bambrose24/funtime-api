import { getGamesBySeason } from "@shared/mysportsfeeds";
import moment from "moment";
import updateGamesAndPicks from "./updateGamesAndPicks";
export default async function keepThingsUpdated() {
  console.log("cron is running at ", moment().toString());

  const games = await getGamesBySeason(2022);

  await updateGamesAndPicks(games);
}
