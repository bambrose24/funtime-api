import httpContext from 'express-http-context';
import {User, UserResponse} from '@supabase/supabase-js';

const USER_CONTEXT_KEY = 'funtime_user';
const TOKEN_CONTEXT_KEY = 'funtime_token';

export function setUser(user: User): void {
  httpContext.set(USER_CONTEXT_KEY, user);
}

export function getUser(): User | undefined {
  return httpContext.get(USER_CONTEXT_KEY) as User | undefined;
}

export function setToken(token: string): void {
  httpContext.set(TOKEN_CONTEXT_KEY, token);
}

export function getToken(): string | undefined {
  return httpContext.get(TOKEN_CONTEXT_KEY) as string | undefined;
}
