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
    await supabase.auth.setSession({ access_token: token, refresh_token: "" });
    const user = await supabase.auth.getUser();
    setToken(token);
    if (user.data.user) {
      setUser(user.data.user);
    }
  } catch (e) {
    console.debug("invalid token passed into auth");
  }
}
