import httpContext from 'express-http-context';
import {createClient} from '@supabase/supabase-js';
import {setToken, setUser} from './user';
import datastore from '@shared/datastore';

export const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

export async function authorizeAndSetSupabaseUser(token: string): Promise<void> {
  try {
    const user = await supabase.auth.getUser(token);
    setToken(token);
    if (user.data.user) {
      const dbUser = await datastore.user.findFirst({where: {email: user.data.user.email}});
      if (dbUser) {
        setUser({supabase: user.data.user, db: dbUser});
      }
    }
  } catch (e) {
    console.debug('invalid token passed into auth', e);
  }
}
