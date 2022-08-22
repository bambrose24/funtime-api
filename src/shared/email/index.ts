import { MailService } from "@sendgrid/mail";
import datastore from "@shared/datastore";
import { Games, People, Picks, Teams } from "@prisma/client";

// const OAuth2Client = new google.auth.OAuth2(
//   process.env.SYSTEM_EMAIL_CLIENT_ID,
//   process.env.SYSTEM_EMAIL_CLIENT_SECRET,
//   "https://developers.google.com/oauthplayground"
// );
// OAuth2Client.setCredentials({
//   refresh_token: process.env.SYSTEM_EMAIL_REFRESH_TOKEN,
// });

const sgMail = new MailService();
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

export async function sendRegistrationMail(
  username: string,
  email: string,
  season: number
): Promise<void> {
  try {
    await sgMail.send({
      to: email,
      from: "bob.ambrose.funtime@gmail.com",
      subject: "Welcome to Funtime 2022!",
      replyToList: [
        { name: "Bob Ambrose", email: "bambrose24@gmail.com" },
        { name: "Erica Ambrose", email: "erica0ambrose@gmail.com" },
      ],
      cc: email !== "bambrose24@gmail.com" ? "bambrose24@gmail.com" : undefined,
      html: getRegistrationText(username, season),
    });
  } catch (e) {
    console.log("got a sendgrid error", JSON.stringify(e));
  }
}

function getRegistrationText(username: string, season: number): string {
  return (
    `Welcome to the ${season} season, ${username}! You're all set.` +
    "<br/><br/>" +
    `Keep an eye out for information when we're closer to the start of the season. ` +
    `You'll only get ` +
    `emails from this system when you make picks.` +
    "<br/><br/>" +
    `The next step will be to pick a winner, loser, and total score for the Super Bowl ` +
    `at the end of the season.` +
    "<br/><br/>" +
    `If you have any questions, reach out to Bob at bambrose24@gmail.com ` +
    `or Erica at billyanderica@verizon.net.`
  );
}

export async function sendPickSuccessEmail(
  member_id: number,
  week: number,
  season: number
): Promise<boolean> {
  const [games, picks, user, teams] = await Promise.all([
    datastore.games.findMany({
      where: { week: { equals: week }, season: { equals: season } },
    }),
    datastore.picks.findMany({
      where: {
        season: { equals: season },
        week: { equals: week },
        member_id: { equals: member_id },
      },
    }),
    datastore.leagueMembers
      .findFirstOrThrow({ where: { membership_id: member_id } })
      .People(),
    datastore.teams.findMany({ where: { teamid: { gt: 0 } } }),
  ]);

  if (!user) {
    throw new Error(
      `Could not load user to send pick confirmation email (member_id: ${member_id})`
    );
  }

  const { email } = user;

  try {
    await sgMail.send({
      to: user.email,
      from: "bob.ambrose.funtime@gmail.com",
      subject: `Your Funtime Picks for Week ${week}, ${season}`,
      replyToList: [
        { name: "Bob Ambrose", email: "bambrose24@gmail.com" },
        { name: "Erica Ambrose", email: "erica0ambrose@gmail.com" },
      ],
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
    console.log(
      `successfully sent picks email to ${user.email} for week ${week}, ${season}`
    );
  } catch (e) {
    console.log("got an error sending pick success email: ", JSON.stringify(e));
  }

  return false;
}

function getWeekPicksContent({
  week,
  season,
  user,
  games,
  picks,
  teams,
}: {
  week: number;
  season: number;
  user: People;
  games: Array<Games>;
  picks: Array<Picks>;
  teams: Array<Teams>;
}): string {
  let res =
    `Congrats ${user.username}! You just made your picks for Week ${week}, ${season}, and ` +
    `they're saved in system. Below is a summary of your picks:`;

  res += "<br/>";
  games.forEach((g) => {
    res += "<br/>";
    const pick = picks.find((p) => p.gid === g.gid);
    if (!pick) {
      throw new Error(
        "could not find pick for game when preparing picks email"
      );
    }

    const winner = pick.winner;
    const winnerTeam = teams.find(({ teamid }) => teamid === winner);
    const loserTeam = teams.find(({ teamid }) => teamid === pick.loser);

    if (!winnerTeam || !loserTeam) {
      throw new Error("could not find winner and loser teams");
    }
    const homeTeam = winnerTeam.teamid === g.home ? winnerTeam : loserTeam;
    const awayTeam = winnerTeam.teamid === g.away ? winnerTeam : loserTeam;
    res += `  ${homeTeam.abbrev || ""} @ ${awayTeam.abbrev || ""} -- ${
      winnerTeam.abbrev || ""
    }`;
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
