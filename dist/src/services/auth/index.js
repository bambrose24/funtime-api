"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSupabaseUser = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
exports.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL || "", process.env.SUPABASE_ANON_KEY || "");
async function setSupabaseUser(token) {
    await exports.supabase.auth.setSession({ access_token: token, refresh_token: "" });
}
exports.setSupabaseUser = setSupabaseUser;
