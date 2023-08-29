import {Game} from '@prisma/client';
import {getNextGame} from '@shared/queries/getNextGame';
import httpContext from 'express-http-context';

type RequestContextParams = {
  getNextGame: {
    params: {leagueId: number; overrideTs?: Date};
    returns: Game | null;
    contextType: Record<number, Game | null>;
  };
};

async function get<T extends keyof RequestContextParams>(
  key: T,
  params: RequestContextParams[T]['params']
): Promise<RequestContextParams[T]['returns'] | null | undefined> {
  switch (key) {
    case 'getNextGame':
      const {leagueId, overrideTs} = params;
      const mapping = (httpContext.get(key) ??
        {}) as RequestContextParams['getNextGame']['contextType'];
      if (!(leagueId in mapping)) {
        const maybeNextGame = await getNextGame({leagueId, overrideTs});
        mapping[leagueId] = maybeNextGame;
      }
      httpContext.set(key, mapping);
      return mapping[leagueId];
  }
}

export const RequestContext = {get};
