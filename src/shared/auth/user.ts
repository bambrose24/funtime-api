import httpContext from 'express-http-context';
import {User as SupabaseUser, UserResponse} from '@supabase/supabase-js';
import {User as DBUser} from '@prisma/client';

type User = {
  supabase: SupabaseUser;
  dbUser: DBUser | null;
};

const USER_CONTEXT_KEY = 'funtime_user';
const TOKEN_CONTEXT_KEY = 'funtime_token';

export function setUser(user: User): void {
  httpContext.set(USER_CONTEXT_KEY, user);
}

export function getUser(): User | undefined {
  return httpContext.get(USER_CONTEXT_KEY) as User | undefined;
}

export function getUserEnforced(): User {
  const user = getUser();
  if (!user) {
    throw new Error('Could not get user in getUserEnforced');
  }
  return user;
}

export function setToken(token: string): void {
  httpContext.set(TOKEN_CONTEXT_KEY, token);
}

export function getToken(): string | undefined {
  return httpContext.get(TOKEN_CONTEXT_KEY) as string | undefined;
}
