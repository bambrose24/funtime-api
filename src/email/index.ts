import nodemailer from "nodemailer";
import { google } from "googleapis";

import { MailService } from "@sendgrid/mail";

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
    `Keep an eye out for information when we're closer to the start of the season. You'll only get emails from this system when you make picks.` +
    "<br/><br/>" +
    `The next step will be to pick a winner, loser, and total score for the Super Bowl at the end of the season.` +
    "<br/><br/>" +
    `If you have any questions, reach out to Bob at bambrose24@gmail.com or Erica at billyanderica@verizon.net.`
  );
}
