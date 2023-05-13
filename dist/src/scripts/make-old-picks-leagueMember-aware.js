"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const datastore_1 = __importDefault(require("@shared/datastore"));
async function run() {
    const picksWithoutMember = await datastore_1.default.pick.findMany({ where: { member_id: { equals: null } } });
    const [people, members, leagues] = await Promise.all([
        datastore_1.default.user.findMany({}),
        datastore_1.default.leagueMember.findMany({}),
        datastore_1.default.league.findMany({}),
    ]);
    const pickUpdates = [];
    const solvedUids = new Set();
    for (let i = 0; i < picksWithoutMember.length; i++) {
        console.log(`updating pick ${i} of ${picksWithoutMember.length}`);
        const pick = picksWithoutMember[i];
        if (solvedUids.has(pick.uid)) {
            continue;
        }
        const league = leagues.find(l => l.season === pick.season);
        const member = members.find(m => m.league_id === league.league_id && m.user_id === pick.uid);
        if (!member) {
            continue;
        }
        await datastore_1.default.pick.updateMany({
            where: { uid: { equals: pick.uid } },
            data: { member_id: member.membership_id },
        });
        solvedUids.add(pick.uid);
    }
}
run();
