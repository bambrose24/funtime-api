import httpContext from 'express-http-context';
import {createClient} from '@supabase/supabase-js';
import {setToken, setUser} from './user';
import datastore from '@shared/datastore';
import * as Sentry from '@sentry/node';
import {PRISMA_CACHES} from '@util/const';

export const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: false,
    },
  }
);

export async function authorizeAndSetSupabaseUser(token: string): Promise<void> {
  try {
    const user = await supabase.auth.getUser(token);
    setToken(token);
    if (user.data.user) {
      const dbUser = await datastore.user.findFirst({
        where: {email: user.data.user.email},
        // cacheStrategy PRISMA_CACHES.oneMinute,
      });
      if (dbUser) {
        Sentry.setUser({
          id: dbUser.uid,
          email: dbUser.email,
          username: dbUser.username,
        });
      } else {
        Sentry.setUser({
          id: user.data.user.id,
          email: user.data.user.email,
        });
      }

      setUser({supabase: user.data.user, dbUser});
    }
  } catch (e) {
    console.debug('invalid token passed into auth', e);
  }
}
