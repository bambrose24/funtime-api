import nodemailer from "nodemailer";

let transporter = nodemailer.createTransport(
  {
    service: "gmail",
    auth: {
      user: process.env.SYSTEM_EMAIL,
      pass: process.env.SYSTEM_EMAIL_PASSWORD,
    },
    logger: true,
  },
  {
    from: '"Funtime System" <bob.ambrose.funtime@gmail.com>',
    cc: "bambrose24@gmail.com",
  }
);

export async function sendRegistrationMail(
  username: string,
  email: string,
  season: number
): Promise<void> {
  const info = await transporter.sendMail({
    to: email,
    subject: "Welcome to Funtime 2022!",
    html: getRegistrationText(username, season),
  });
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
