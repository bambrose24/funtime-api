import {Game} from '@prisma/client';
import datastore from '@shared/datastore';

export async function getNextGame({
  leagueId,
  overrideTs,
}: {
  leagueId: number;
  overrideTs?: Date;
}): Promise<Game | null> {
  const league = await datastore.league.findUniqueOrThrow({where: {league_id: leagueId}});
  const now = overrideTs ?? new Date();
  const games = await datastore.game.findMany({
    where: {ts: {gt: now}, season: league.season},
    orderBy: {ts: 'asc'},
    take: 1,
  });
  if (games && games.length > 0) {
    return games[0];
  }
  return null;
}
