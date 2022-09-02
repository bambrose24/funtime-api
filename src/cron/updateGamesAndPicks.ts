import datastore from "@shared/datastore";
import { MSFGame } from "@shared/mysportsfeeds/types";
import { SEASON } from "src/graphql/resolvers/register";

export default async function updateGamesAndPicks(games: Array<MSFGame>) {
  const dbGames = await datastore.games.findMany({
    where: {
      season: { equals: SEASON },
      week: { in: games.map((g) => g.schedule.week) },
    },
  });

  // TODO add msf_id to games so we can work with them 1:1 here
  // TODO adjust homescore and awayscore and ts for each game based on MSF result
  // if playedStatus === COMPLETE then mark the game done
}
