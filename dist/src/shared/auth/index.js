"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeAndSetSupabaseUser = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const user_1 = require("./user");
const datastore_1 = __importDefault(require("@shared/datastore"));
exports.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '');
async function authorizeAndSetSupabaseUser(token) {
    try {
        const user = await exports.supabase.auth.getUser(token);
        (0, user_1.setToken)(token);
        if (user.data.user) {
            const dbUser = await datastore_1.default.user.findFirst({ where: { email: user.data.user.email } });
            if (dbUser) {
                (0, user_1.setUser)({ supabase: user.data.user, dbUser });
            }
        }
    }
    catch (e) {
        console.debug('invalid token passed into auth', e);
    }
}
exports.authorizeAndSetSupabaseUser = authorizeAndSetSupabaseUser;
