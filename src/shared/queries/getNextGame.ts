import {Game} from '@prisma/client';
import datastore from '@shared/datastore';

export async function getNextGame(overrideTs?: Date): Promise<Game | null> {
  console.log('');
  const now = overrideTs ?? new Date();
  const games = await datastore.game.findMany({
    where: {ts: {gt: now}},
    orderBy: {ts: 'asc'},
    take: 1,
  });
  if (games && games.length > 0) {
    return games[0];
  }
  return null;
}
