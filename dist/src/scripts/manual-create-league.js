"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const datastore_1 = __importDefault(require("@shared/datastore"));
const const_1 = require("@util/const");
const nanoid_1 = require("nanoid");
async function run() {
    const bob = await datastore_1.default.user.findFirstOrThrow({ where: { email: 'bambrose24@gmail.com' } });
    const now = new Date();
    const shareCode = (0, nanoid_1.nanoid)();
    const league = await datastore_1.default.league.create({
        data: {
            name: 'Funtime 2023',
            season: const_1.SEASON,
            share_code: shareCode,
            created_by_user_id: bob.uid,
            superbowl_competition: true,
            created_time: now,
            late_policy: 'allow_late_whole_week',
            pick_policy: 'choose_winner',
            reminder_policy: 'three_hours_before',
            scoring_type: 'game_winner',
        },
    });
    const membership = await datastore_1.default.leagueMember.create({
        data: {
            league_id: league.league_id,
            user_id: bob.uid,
            role: 'admin',
            ts: now,
        },
    });
    console.log(`created league ${league.league_id} with membership ${membership.membership_id}`);
}
run();
