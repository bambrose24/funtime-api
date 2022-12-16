"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeAndSetSupabaseUser = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const user_1 = require("./user");
exports.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL || "", process.env.SUPABASE_ANON_KEY || "");
async function authorizeAndSetSupabaseUser(token) {
    try {
        await exports.supabase.auth.setSession({ access_token: token, refresh_token: "" });
        const user = await exports.supabase.auth.getUser();
        (0, user_1.setToken)(token);
        if (user.data.user) {
            (0, user_1.setUser)(user.data.user);
        }
    }
    catch (e) {
        console.debug("invalid token passed into auth");
    }
}
exports.authorizeAndSetSupabaseUser = authorizeAndSetSupabaseUser;