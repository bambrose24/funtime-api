"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const datastore_1 = __importDefault(require("@shared/datastore"));
async function run() {
    const picksWithoutMember = await datastore_1.default.pick.findMany({});
    const [people, members, leagues] = await Promise.all([
        datastore_1.default.user.findMany({}),
        datastore_1.default.leagueMember.findMany({}),
        datastore_1.default.league.findMany({}),
    ]);
    const pickUpdates = [];
    const solvedMembershipIds = new Set();
    for (let i = 0; i < picksWithoutMember.length; i++) {
        console.log(`updating pick ${i} of ${picksWithoutMember.length}`);
        const pick = picksWithoutMember[i];
        const league = leagues.find(l => l.season === pick.season);
        const member = members.find(m => m.league_id === league.league_id && m.user_id === pick.uid);
        if (!member) {
            continue;
        }
        if (pick.member_id !== member.membership_id) {
            console.log(`  [doing real update pickid ${pick.pickid} to member_id ${member.membership_id} from ${pick.member_id}]`);
            await datastore_1.default.pick.update({
                where: { pickid: pick.pickid },
                data: { member_id: member.membership_id },
            });
        }
        else {
            console.log(`  [skipping update for pickid ${pick.pickid} because already equal members]`);
        }
        solvedMembershipIds.add(member.membership_id);
    }
}
run();
