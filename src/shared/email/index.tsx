import * as React from 'react';
import {League, User} from '@prisma/client';
import datastore from '../datastore';
import {resend} from './client';
import {RegistrationEmail} from './react/registration/RegistrationEmail';

import {getDefaultSendParams, getWeekPicksContent} from './util';

// const OAuth2Client = new google.auth.OAuth2(
//   process.env.SYSTEM_EMAIL_CLIENT_ID,
//   process.env.SYSTEM_EMAIL_CLIENT_SECRET,
//   "https://developers.google.com/oauthplayground"
// );
// OAuth2Client.setCredentials({
//   refresh_token: process.env.SYSTEM_EMAIL_REFRESH_TOKEN,
// });

export async function sendRegistrationMail(
  user: User,
  league: League,
  superbowlWinner: number,
  superbowlLoser: number,
  superbowlScore: number
): Promise<void> {
  const teams = await datastore.team.findMany({
    where: {teamid: {gte: 0}},
  });

  const winner = teams.find(t => t.teamid === superbowlWinner)!;
  const loser = teams.find(t => t.teamid === superbowlLoser)!;

  try {
    await resend.sendEmail({
      ...getDefaultSendParams(user.email),
      to: user.email,
      from: 'team@play-funtime.com',
      subject: `Welcome to ${league.name}!`,
      react: (
        <RegistrationEmail
          email={user.email}
          leagueName={league.name}
          superbowl={
            loser && winner
              ? {
                  superBowlLoser: loser.abbrev || '',
                  superBowlScore: superbowlScore,
                  superBowlWinner: winner.abbrev || '',
                }
              : undefined
          }
          username={user.username}
        />
      ),
    });
  } catch (e) {
    console.log('got a sendgrid error', JSON.stringify(e));
  }
}

export async function sendPickSuccessEmail(
  member_id: number,
  week: number,
  season: number
): Promise<boolean> {
  const [games, picks, user, teams] = await Promise.all([
    datastore.game.findMany({
      where: {week: {equals: week}, season: {equals: season}},
    }),
    datastore.pick.findMany({
      where: {
        season: {equals: season},
        week: {equals: week},
        member_id: {equals: member_id},
      },
    }),
    datastore.leagueMember.findFirstOrThrow({where: {membership_id: member_id}}).people(),
    datastore.team.findMany({where: {teamid: {gt: 0}}}),
  ]);

  if (!user) {
    throw new Error(
      `Could not load user to send pick confirmation email (member_id: ${member_id})`
    );
  }

  const {email} = user;

  try {
    await resend.sendEmail({
      ...getDefaultSendParams(email),
      to: user.email,
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
    console.log(`successfully sent picks email to ${user.email} for week ${week}, ${season}`);
  } catch (e) {
    console.log('got an error sending pick success email: ', JSON.stringify(e));
  }

  return false;
}
