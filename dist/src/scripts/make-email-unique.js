"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const datastore_1 = __importDefault(require("@shared/datastore"));
const lodash_1 = __importDefault(require("lodash"));
async function run() {
    // plan: look at all people, group by email. Pick the max uid, and then update picks for the "old" ones to reference the old uids
    // also gotta make leagues for the previous seasons, and leagueMembers that reference these new users
    // then can remove uid from picks
    // const users = await datastore.user.findMany();
    // did this in general but had one lingering, keeping for posterity
    // await datastore.pick.updateMany({
    //   data: { uid: 292 },
    //   where: { uid: 50 },
    // });
    // await datastore.superbowl.updateMany({
    //   data: { uid: 292 },
    //   where: { uid: 50 },
    // });
    // await datastore.superbowlSquare.updateMany({
    //   data: { uid: 292 },
    //   where: { uid: 50 },
    // });
    // await datastore.leagueMember.updateMany({
    //   data: { user_id: 292 },
    //   where: { user_id: 50 },
    // });
    // await datastore.league.updateMany({
    //   data: { created_by_user_id: 292 },
    //   where: { created_by_user_id: 50 },
    // });
    const picks = await datastore_1.default.pick.findMany({
        include: {
            leaguemembers: { include: { leagues: true } },
        },
    });
    const picksGrouped = await Object.values(lodash_1.default.groupBy(picks, p => p.leaguemembers?.league_id));
    const users = await datastore_1.default.user.findMany();
    // await datastore.user.delete({ where: { uid: 50 } });
    const johnPicks = await datastore_1.default.pick.findMany({ where: { uid: 50 } });
    console.log('johnPicks', johnPicks.length);
    const usersGroupedByEmail = lodash_1.default.groupBy(users, u => u.email);
    const noEmail = users.filter(u => !u.email);
    console.log('noEmail', noEmail);
    console.log('duplicateEmails', Object.values(usersGroupedByEmail).filter(x => x.length > 1));
    Object.values(usersGroupedByEmail).forEach(userList => {
        if (userList.length > 1) {
            console.log('userList', userList.length, userList);
        }
    });
    // console.log(Object.keys(picksGrouped), picks.slice(0, 3));
}
run();
