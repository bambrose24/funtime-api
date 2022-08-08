"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPickSuccessEmail = exports.sendRegistrationMail = void 0;
const mail_1 = require("@sendgrid/mail");
const datastore_1 = __importDefault(require("@shared/datastore"));
// const OAuth2Client = new google.auth.OAuth2(
//   process.env.SYSTEM_EMAIL_CLIENT_ID,
//   process.env.SYSTEM_EMAIL_CLIENT_SECRET,
//   "https://developers.google.com/oauthplayground"
// );
// OAuth2Client.setCredentials({
//   refresh_token: process.env.SYSTEM_EMAIL_REFRESH_TOKEN,
// });
const sgMail = new mail_1.MailService();
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");
async function sendRegistrationMail(username, email, season) {
    try {
        await sgMail.send({
            to: email,
            from: "bob.ambrose.funtime@gmail.com",
            subject: "Welcome to Funtime 2022!",
            cc: email !== "bambrose24@gmail.com" ? "bambrose24@gmail.com" : undefined,
            html: getRegistrationText(username, season),
        });
    }
    catch (e) {
        console.log("got a sendgrid error", JSON.stringify(e));
    }
}
exports.sendRegistrationMail = sendRegistrationMail;
function getRegistrationText(username, season) {
    return (`Welcome to the ${season} season, ${username}! You're all set.` +
        "<br/><br/>" +
        `Keep an eye out for information when we're closer to the start of the season. ` +
        `You'll only get ` +
        `emails from this system when you make picks.` +
        "<br/><br/>" +
        `The next step will be to pick a winner, loser, and total score for the Super Bowl ` +
        `at the end of the season.` +
        "<br/><br/>" +
        `If you have any questions, reach out to Bob at bambrose24@gmail.com ` +
        `or Erica at billyanderica@verizon.net.`);
}
async function sendPickSuccessEmail(member_id, week, season) {
    const [games, picks, user, teams] = await Promise.all([
        datastore_1.default.games.findMany({
            where: { week: { equals: week }, season: { equals: season } },
        }),
        datastore_1.default.picks.findMany({
            where: {
                season: { equals: season },
                week: { equals: week },
                member_id: { equals: member_id },
            },
        }),
        datastore_1.default.leagueMembers
            .findFirstOrThrow({ where: { membership_id: member_id } })
            .People(),
        datastore_1.default.teams.findMany({ where: { teamid: { gt: 0 } } }),
    ]);
    if (!user) {
        throw new Error(`Could not load user to send pick confirmation email (member_id: ${member_id})`);
    }
    const { email } = user;
    try {
        await sgMail.send({
            to: user.email,
            from: "bob.ambrose.funtime@gmail.com",
            subject: `Your Funtime Picks for Week ${week}, ${season}`,
            cc: email !== "bambrose24@gmail.com" ? "bambrose24@gmail.com" : undefined,
            html: getWeekPicksContent({
                week,
                season,
                user,
                games,
                picks,
                teams,
            }),
        });
        console.log(`successfully sent picks email to ${user.email} for week ${week}, ${season}`);
    }
    catch (e) {
        console.log("got an error sending pick success email: ", JSON.stringify(e));
    }
    return false;
}
exports.sendPickSuccessEmail = sendPickSuccessEmail;
function getWeekPicksContent({ week, season, user, games, picks, teams, }) {
    let res = `Congrats ${user.username}! You just made your picks for Week ${week}, ${season}, and ` +
        `they're saved in system. Below is a summary of your picks:`;
    res += "<br/>";
    games.forEach((g) => {
        res += "<br/>";
        const pick = picks.find((p) => p.gid === g.gid);
        if (!pick) {
            throw new Error("could not find pick for game when preparing picks email");
        }
        const winner = pick.winner;
        const winnerTeam = teams.find(({ teamid }) => teamid === winner);
        const loserTeam = teams.find(({ teamid }) => teamid === pick.loser);
        if (!winnerTeam || !loserTeam) {
            throw new Error("could not find winner and loser teams");
        }
        const homeTeam = winnerTeam.teamid === g.home ? winnerTeam : loserTeam;
        const awayTeam = winnerTeam.teamid === g.away ? winnerTeam : loserTeam;
        res += `  ${homeTeam.abbrev || ""} @ ${awayTeam.abbrev || ""} -- ${winnerTeam.abbrev || ""}`;
        if (pick.score) {
            res += ` (total score ${pick.score})`;
        }
    });
    res += "<br/><br/>";
    res += "If you have any questions, reach out to Bob at bambrose24@gmail.com";
    res += "<br/>";
    res += " - Funtime System";
    return res;
}
