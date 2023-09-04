import * as React from 'react';
import {EmailType, League, User} from '@prisma/client';
import datastore from '../datastore';
import {resend} from './client';
import {RegistrationEmail} from './react/registration/RegistrationEmail';
import {WeekPicksReminder} from './react/reminders/WeekPicksReminder';

import {getDefaultSendParams, getWeekPicksContent} from './util';
import {PicksSummary} from './react/picks/PicksSummary';

export async function sendRegistrationMail(
  user: User,
  league: League,
  superbowlWinner: number,
  superbowlLoser: number,
  superbowlScore: number
) {
  const teams = await datastore.team.findMany({
    where: {teamid: {gte: 0}},
  });

  const winner = teams.find(t => t.teamid === superbowlWinner)!;
  const loser = teams.find(t => t.teamid === superbowlLoser)!;

  try {
    return await resend.sendEmail({
      ...getDefaultSendParams(user.email),
      to: user.email,
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
    console.error('got a email send error', JSON.stringify(e));
  }
  return null;
}

export async function sendPickSuccessEmail(
  member_id: number,
  week: number,
  season: number
): Promise<boolean> {
  const [games, picks, user, teams, league] = await Promise.all([
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
    datastore.leagueMember.findFirstOrThrow({
      where: {membership_id: member_id},
      select: {leagues: true},
    }),
  ]);

  if (!user) {
    throw new Error(
      `Could not load user to send pick confirmation email (member_id: ${member_id})`
    );
  }

  const {email} = user;

  try {
    const response = await resend.sendEmail({
      ...getDefaultSendParams(email),
      to: user.email,
      subject: `Your Funtime Picks for Week ${week}, ${season}`,
      react: (
        <PicksSummary
          week={week}
          league={league.leagues}
          user={user}
          games={games}
          picks={picks}
          teams={teams}
        />
      ),
    });
    await datastore.emailLogs.create({
      data: {
        email_type: EmailType.week_picks,
        resend_id: response.id,
        week: week,
        league_id: league.leagues.league_id,
        member_id: member_id,
      },
    });
    console.log(`successfully sent picks email to ${user.email} for week ${week}, ${season}`);
  } catch (e) {
    console.log('got an error sending pick success email: ', JSON.stringify(e));
  }

  return false;
}

export async function sendWeekReminderEmail({
  leagueName,
  leagueId,
  username,
  week,
  email,
  weekStartTime,
}: {
  leagueName: string;
  leagueId: number;
  username: string;
  email: string;
  week: number;
  weekStartTime: Date;
}) {
  if (email !== 'bambrose24@gmail.com') {
    return null;
  }
  console.info(`Sending week pick reminder to ${email} for week ${week}`);
  return await resend.sendEmail({
    ...getDefaultSendParams(email),
    to: email,
    subject: `REMINDER: Make your Funtime picks for week ${week}`,
    react: (
      <WeekPicksReminder
        week={week}
        username={username}
        leagueId={leagueId}
        leagueName={leagueName}
        weekStartTime={weekStartTime}
      />
    ),
  });
}
