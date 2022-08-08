/* eslint-disable @typescript-eslint/no-unsafe-argument */
if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  require("dotenv").config();
}
import { Games } from "@prisma/client";
import datastore from "@shared/datastore";

// npx ts-node src/scripts/update-tiebreakers.ts
async function run() {
  const games = await datastore.games.findMany({
    where: { season: { equals: 2022 } },
    orderBy: { ts: "asc" },
  });
  const weeks = new Set(games.map((g) => g.week));
  const gamesToMakeTiebreakers: Games[] = [];
  weeks.forEach((week) => {
    const weekGames = games.filter((g) => g.week === week);
    gamesToMakeTiebreakers.push(weekGames[weekGames.length - 1]);
  });

  console.log(`going to update ${gamesToMakeTiebreakers.length} games`);
  const { count } = await datastore.games.updateMany({
    where: {
      gid: { in: gamesToMakeTiebreakers.map((g) => g.gid) },
    },
    data: { is_tiebreaker: true },
  });
  console.log(`affected ${count} rows`);
}

run();
