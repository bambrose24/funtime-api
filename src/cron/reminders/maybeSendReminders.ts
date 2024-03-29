import {EmailType, LatePolicy, ReminderPolicy} from '@prisma/client';
import {datastore} from '@shared/datastore';
import {sendWeekReminderEmail} from '@shared/email';
import {DEFAULT_SEASON} from '@util/const';
import {nextNotStartedGame} from '@util/data/nextNotStartedGame';
import {logger} from '@util/logger';
import moment from 'moment';

export async function maybeSendReminders() {
  const currentSeason = DEFAULT_SEASON;
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
    logger.info(`No game found for nextNotStartedGame, not sending reminders`);
    return;
  }

  logger.info(
    `Going to attempt to send reminders for ${leaguesForSeason.length} leagues ${JSON.stringify(
      leaguesForSeason.map(l => {
        return {league_id: l.league_id};
      })
    )}`
  );
  for (const league of leaguesForSeason) {
    const reminderPolicy = league.reminder_policy;
    if (!reminderPolicy) {
      // no reminder policy so skip
      continue;
    }

    const sendReminders = shouldSendReminders(reminderPolicy, game.ts);
    if (!sendReminders) {
      logger.info(
        `Not sending reminders for league ${league.league_id} ${game.ts}, ${moment(game.ts)
          .subtract(3, 'hours')
          .toDate() < new Date()} ${new Date()}, ${reminderPolicy}`
      );
      continue;
    }
    logger.info(`Going to send reminders because sendReminders was true`);

    const leagueReminderEmails = allExistingEmails.filter(e => e.league_id === league.league_id);
    const members = membersInLeagues.filter(m => m.league_id === league.league_id);
    const membersPicksForWeek = await datastore.pick.findMany({
      where: {
        member_id: {in: members.map(m => m.membership_id)},
        week: game.week,
      },
    });
    const pickedMembers = new Set(membersPicksForWeek.map(p => p.member_id));
    logger.info(
      `All the members to ponder reminders to ${JSON.stringify(members.map(m => m.membership_id))}`
    );
    for (const member of members) {
      if (pickedMembers.has(member.membership_id)) {
        continue;
      }
      logger.info(
        `Going to send reminder to ${member.people.email} (${member.people.uid}, ${member.people.username}) for week ${game.week}`
      );
      const existingReminder = leagueReminderEmails.find(
        email =>
          email?.week && email.week === game.week && email.email_type === EmailType.week_reminder
      );
      if (!existingReminder) {
        // time to send a reminder to this person
        const response = await sendWeekReminderEmail({
          leagueName: league.name,
          leagueId: league.league_id,
          email: member.people.email,
          username: member.people.username,
          week: game.week,
          weekStartTime: game.ts,
        });
        logger.info(
          `Got response from reminder email to ${member.people.email}: ${JSON.stringify(response)}`
        );
        if (response) {
          await datastore.emailLogs.create({
            data: {
              email_type: EmailType.week_reminder,
              resend_id: response.id,
              member_id: member.membership_id,
              league_id: member.league_id,
              week: game.week,
            },
          });
        }
      }
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
          .toDate() < now
      );
  }
}
