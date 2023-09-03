import {LatePolicy, ReminderPolicy} from '@prisma/client';
import datastore from '@shared/datastore';
import {sendWeekReminderEmail} from '@shared/email';
import {SEASON} from '@util/const';
import {nextNotStartedGame} from '@util/data/nextNotStartedGame';
import moment from 'moment';

export async function maybeSendReminders() {
  const currentSeason = SEASON;
  const now = new Date();

  const leaguesForSeason = await datastore.league.findMany({where: {season: currentSeason}});
  const leagueIds = leaguesForSeason.map(l => l.league_id);
  const [membersInLeagues, allExistingEmails] = await Promise.all([
    datastore.leagueMember.findMany({
      where: {league_id: {in: leagueIds}},
      select: {
        league_id: true,
        membership_id: true,
        people: true,
      },
    }),
    datastore.emailLogs.findMany({where: {league_id: {in: leagueIds}}}),
  ]);
  const game = await nextNotStartedGame();
  if (!game) {
    return;
  }

  for (const league of leaguesForSeason) {
    const reminderPolicy = league.reminder_policy;
    if (!reminderPolicy) {
      // no reminder policy so skip
      continue;
    }

    const sendReminders = shouldSendReminders(reminderPolicy, game.ts);
    if (!sendReminders) {
      continue;
    }

    const leagueEmails = allExistingEmails.filter(e => e.league_id === league.league_id);
    const members = membersInLeagues.filter(m => m.league_id === league.league_id);
    const membersPicksForWeek = await datastore.pick.findMany({
      where: {
        member_id: {in: members.map(m => m.membership_id)},
        week: game.week,
      },
    });
    const pickedMembers = new Set(membersPicksForWeek.map(p => p.member_id));
    for (const member of members) {
      // if (pickedMembers.has(member.membership_id)) {
      //   continue;
      // }
      if (member.people.email !== 'bambrose24@gmail.com') {
        return;
      }
      // time to send a reminder to this person
      sendWeekReminderEmail({
        leagueName: league.name,
        leagueId: league.league_id,
        email: member.people.email,
        username: member.people.username,
        week: game.week,
        weekStartTime: game.ts,
      });
    }
  }
}

function shouldSendReminders(policy: ReminderPolicy, nextGameTime: Date): boolean {
  const now = new Date();
  // see if the league should be sent reminders
  switch (policy) {
    case ReminderPolicy.three_hours_before:
      return (
        moment(nextGameTime)
          .subtract(3, 'hours')
          .toDate() > now
      );
  }
}
