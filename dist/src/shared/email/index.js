'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
Object.defineProperty(exports, '__esModule', {value: true});
exports.sendPickSuccessEmail = exports.sendRegistrationMail = void 0;
const datastore_1 = __importDefault(require('@shared/datastore'));
const client_1 = __importDefault(require('./client'));
const util_1 = require('./util');
// const OAuth2Client = new google.auth.OAuth2(
//   process.env.SYSTEM_EMAIL_CLIENT_ID,
//   process.env.SYSTEM_EMAIL_CLIENT_SECRET,
//   "https://developers.google.com/oauthplayground"
// );
// OAuth2Client.setCredentials({
//   refresh_token: process.env.SYSTEM_EMAIL_REFRESH_TOKEN,
// });
async function sendRegistrationMail(user, season, superbowlWinner, superbowlLoser, superbowlScore) {
  const teams = await datastore_1.default.team.findMany({
    where: {teamid: {gte: 0}},
  });
  const winner = teams.find(t => t.teamid === superbowlWinner);
  const loser = teams.find(t => t.teamid === superbowlLoser);
  try {
    await client_1.default.send({
      ...(0, util_1.getDefaultSendParams)(user.email),
      to: user.email,
      from: 'bob.ambrose.funtime@gmail.com',
      subject: 'Welcome to Funtime 2022!',
      html: (0, util_1.getRegistrationText)(user.username, season, winner, loser, superbowlScore),
    });
  } catch (e) {
    console.log('got a sendgrid error', JSON.stringify(e));
  }
}
exports.sendRegistrationMail = sendRegistrationMail;
async function sendPickSuccessEmail(member_id, week, season) {
  const [games, picks, user, teams] = await Promise.all([
    datastore_1.default.game.findMany({
      where: {week: {equals: week}, season: {equals: season}},
    }),
    datastore_1.default.pick.findMany({
      where: {
        season: {equals: season},
        week: {equals: week},
        member_id: {equals: member_id},
      },
    }),
    datastore_1.default.leagueMember.findFirstOrThrow({where: {membership_id: member_id}}).people(),
    datastore_1.default.team.findMany({where: {teamid: {gt: 0}}}),
  ]);
  if (!user) {
    throw new Error(
      `Could not load user to send pick confirmation email (member_id: ${member_id})`
    );
  }
  const {email} = user;
  try {
    await client_1.default.send({
      ...(0, util_1.getDefaultSendParams)(email),
      to: user.email,
      from: 'bob.ambrose.funtime@gmail.com',
      subject: `Your Funtime Picks for Week ${week}, ${season}`,
      html: (0, util_1.getWeekPicksContent)({
        week,
        season,
        user,
        games,
        picks,
        teams,
      }),
    });
    console.log(`successfully sent picks email to ${user.email} for week ${week}, ${season}`);
  } catch (e) {
    console.log('got an error sending pick success email: ', JSON.stringify(e));
  }
  return false;
}
exports.sendPickSuccessEmail = sendPickSuccessEmail;
