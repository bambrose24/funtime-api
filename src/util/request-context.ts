import {Game, League} from '@prisma/client';
import {datastore} from '@shared/datastore';
import {getGamesByWeek} from '@shared/mysportsfeeds';
import {MSFGame} from '@shared/mysportsfeeds/types';
import {getNextGame} from '@shared/queries/getNextGame';
import httpContext from 'express-http-context';
import {PRISMA_CACHES} from './const';

type RequestContextTypes = {
  getGamesByWeek: {
    params: {week: number; season: number};
    returns: MSFGame[];
  };
  getNextGame: {
    params: {leagueId: number; overrideTs?: Date};
    returns: Game | null;
  };
  getLeague: {
    params: {leagueId: number};
    returns: League | null;
  };
};

async function get<T extends keyof RequestContextTypes>(
  key: T,
  params: RequestContextTypes[T]['params']
): Promise<RequestContextTypes[T]['returns'] | null | undefined> {
  switch (key) {
    case 'getNextGame': {
      const {leagueId, overrideTs} = params as RequestContextTypes['getNextGame']['params'];
      const contextMap = (httpContext.get(key) ?? {}) as Record<number, Game | null>;
      if (!(leagueId in contextMap)) {
        const maybeNextGame = await getNextGame({leagueId, overrideTs});
        contextMap[leagueId] = maybeNextGame;
      }
      httpContext.set(key, contextMap);
      return contextMap[leagueId];
    }
    case 'getGamesByWeek': {
      const {week, season} = params as RequestContextTypes['getGamesByWeek']['params'];
      const contextMap = (httpContext.get(key) ?? {}) as Record<string, MSFGame[]>;
      const contextKey = `${week}_${season}`;
      if (!(contextKey in contextMap)) {
        const fromMSF = await getGamesByWeek(season, week);
        contextMap[contextKey] = fromMSF;
      }
      httpContext.set(key, contextMap);
      return contextMap[contextKey];
    }
    case 'getLeague': {
      const {leagueId} = params as RequestContextTypes['getLeague']['params'];
      const contextMap = (httpContext.get(key) ?? {}) as Record<number, League | null>;
      if (!(leagueId in contextMap)) {
        const league = await datastore.league.findFirst({
          where: {league_id: leagueId},
          // cacheStrategy PRISMA_CACHES.oneHour,
        });
        contextMap[leagueId] = league;
      }
      httpContext.set(key, contextMap);
      return contextMap[leagueId];
    }
  }
}

export const RequestContext = {get};
