import httpContext from "express-http-context";
import { createClient } from "@supabase/supabase-js";
import { setToken, setUser } from "./user";

export const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_ANON_KEY || ""
);

export async function authorizeAndSetSupabaseUser(
  token: string
): Promise<void> {
  try {
    const user = await supabase.auth.getUser(token);
    setToken(token);
    if (user.data.user) {
      setUser(user.data.user);
    }
  } catch (e) {
    console.debug("invalid token passed into auth", e);
  }
}
