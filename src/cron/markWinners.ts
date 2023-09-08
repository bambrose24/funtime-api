import datastore from '@shared/datastore';
import {calculateWinnersFromDonePicks} from '@shared/winner';

export async function markWinners(season: number) {
  const [leaguesForSeason, games] = await Promise.all([
    datastore.league.findMany({where: {season}}),
    datastore.game.findMany({where: {season}, select: {gid: true, week: true}}),
  ]);

  console.info(`going to mark winners for season ${season} (${leaguesForSeason.length} leagues)`);
  const seasonWeeks = Array.from(new Set(games.map(g => g.week)));

  for (const league of leaguesForSeason) {
    const {league_id} = league;
    const existingWinnersForSeason = await datastore.weekWinners.findMany({where: {league_id}});
    console.info(`existing winners for season ${existingWinnersForSeason.length}`);
    const weeksWithWinners = Array.from(new Set(existingWinnersForSeason.map(w => w.week)));
    const weeksToCheck = seasonWeeks.filter(w => !weeksWithWinners.includes(w));
    for (const week of weeksToCheck) {
      const winners = await getWinners({league_id, season, week});
      if (winners && winners.length) {
        for (const winner of winners) {
          for (const member of winner.member) {
            console.info(
              `creating winner for ${week} ${season} for league ${league_id} - ${member.membership_id}`
            );
            await datastore.weekWinners.create({
              data: {
                league_id,
                week,
                membership_id: member.membership_id,
                score_diff: winner.score_diff,
                correct_count: winner.correct,
              },
            });
          }
        }
      }
    }
  }
}

async function getWinners({
  league_id,
  season,
  week,
}: {
  league_id: number;
  season: number;
  week: number;
}) {
  console.log(`getting winners for ${league_id} ${season} ${week}`);
  const members = await datastore.leagueMember.findMany({
    where: {league_id},
  });
  const picks = await datastore.pick.findMany({
    where: {
      leaguemembers: {league_id},
      season,
      week,
    },
  });
  const games = await datastore.game.findMany({
    where: {
      season,
      week,
    },
  });

  console.log(`found ${members.length} members, ${picks.length} picks, ${games.length} games`);

  const winners = await calculateWinnersFromDonePicks(league_id, picks, games);

  return winners
    .filter(winner => winner.member_ids && winner.member_ids.length > 0)
    .map(winner => {
      return {
        member: members.filter(m => winner.member_ids?.includes(m.membership_id)),
        week: winner.week,
        correct: winner.num_correct || 0,
        score_diff: winner.score_diff || 0,
      };
    });
}
