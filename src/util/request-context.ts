import {Game} from '@prisma/client';
import {getGamesByWeek} from '@shared/mysportsfeeds';
import {MSFGame} from '@shared/mysportsfeeds/types';
import {getNextGame} from '@shared/queries/getNextGame';
import httpContext from 'express-http-context';

type RequestContextTypes = {
  getGamesByWeek: {
    params: {week: number; season: number};
    returns: MSFGame[];
  };
  getNextGame: {
    params: {leagueId: number; overrideTs?: Date};
    returns: Game | null;
  };
};

async function get<T extends keyof RequestContextTypes>(
  key: T,
  params: RequestContextTypes[T]['params']
): Promise<RequestContextTypes[T]['returns'] | null | undefined> {
  switch (key) {
    case 'getNextGame':
      const {leagueId, overrideTs} = params as RequestContextTypes['getNextGame']['params'];
      const mapping = (httpContext.get(key) ?? {}) as Record<number, Game | null>;
      if (!(leagueId in mapping)) {
        const maybeNextGame = await getNextGame({leagueId, overrideTs});
        mapping[leagueId] = maybeNextGame;
      }
      httpContext.set(key, mapping);
      return mapping[leagueId];
    case 'getGamesByWeek':
      const {week, season} = params as RequestContextTypes['getGamesByWeek']['params'];
      const fromContext = (httpContext.get(key) ?? {}) as Record<string, MSFGame[]>;
      const contextKey = `${week}_${season}`;
      if (!(contextKey in fromContext)) {
        const fromMSF = await getGamesByWeek(season, week);
        fromContext[contextKey] = fromMSF;
      }
      return fromContext[contextKey];
  }
}

export const RequestContext = {get};
