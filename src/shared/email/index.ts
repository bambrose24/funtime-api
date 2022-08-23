import datastore from "@shared/datastore";
import mailClient from "./client";

import {
  getDefaultSendParams,
  getRegistrationText,
  getWeekPicksContent,
} from "./util";

// const OAuth2Client = new google.auth.OAuth2(
//   process.env.SYSTEM_EMAIL_CLIENT_ID,
//   process.env.SYSTEM_EMAIL_CLIENT_SECRET,
//   "https://developers.google.com/oauthplayground"
// );
// OAuth2Client.setCredentials({
//   refresh_token: process.env.SYSTEM_EMAIL_REFRESH_TOKEN,
// });

export async function sendRegistrationMail(
  username: string,
  email: string,
  season: number,
  superbowlWinner: number,
  superbowlLoser: number,
  superbowlScore: number
): Promise<void> {
  const teams = await datastore.teams.findMany({
    where: { teamid: { gte: 0 } },
  });

  const winner = teams.find((t) => t.teamid === superbowlWinner)!;
  const loser = teams.find((t) => t.teamid === superbowlLoser)!;

  try {
    await mailClient.send({
      ...getDefaultSendParams(email),
      to: email,
      from: "bob.ambrose.funtime@gmail.com",
      subject: "Welcome to Funtime 2022!",
      html: getRegistrationText(
        username,
        season,
        winner,
        loser,
        superbowlScore
      ),
    });
  } catch (e) {
    console.log("got a sendgrid error", JSON.stringify(e));
  }
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
    await mailClient.send({
      ...getDefaultSendParams(email),
      to: user.email,
      from: "bob.ambrose.funtime@gmail.com",
      subject: `Your Funtime Picks for Week ${week}, ${season}`,
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
