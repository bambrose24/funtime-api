import {Game, League, Pick, Team, User} from '@prisma/client';
import {Container, Hr, Html, Section, SectionProps, Text} from '@react-email/components';
import React from 'react';
import {FuntimeButton} from '../components/FuntimeButton';
import {TeamLogo} from '../components/TeamLogo';
import {colors} from '../theme';

type PicksSummaryProps = {
  week: number;
  league: League;
  picks: Pick[];
  teams: Team[];
  games: Game[];
  user: User;
};

export function PicksSummary({week, league, picks, teams, games, user}: PicksSummaryProps) {
  return (
    <Html style={{paddingBottom: '20px'}}>
      <Container>
        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
          <Text>
            Contgrats, {user.username}! Your picks are in for week {week}, {league.season}! See your
            summary below.
          </Text>
          {picks.map((pick, i) => {
            const game = games.find(g => pick.gid === g.gid);

            if (!game) {
              return null;
            }
            const homeTeam = teams.find(t => t.teamid === game.home);
            const awayTeam = teams.find(t => t.teamid === game.away);
            if (!homeTeam || !awayTeam) {
              return null;
            }

            const chosenStyle: SectionProps['style'] = {
              border: '1px solid',
              borderColor: colors.primary,
              borderRadius: '4px',
            };
            return (
              <div style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '8px',
                    justifyContent: 'space-between',
                    width: '100%',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '8px 8px 8px 8px',
                      ...(pick.winner === awayTeam.teamid ? chosenStyle : {}),
                    }}
                  >
                    <TeamLogo abbrev={awayTeam.abbrev!} height="40px" width="40px" />
                    <Text>{awayTeam.abbrev}</Text>
                  </div>
                  <Text>@</Text>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '8px 8px 8px 8px',
                      ...(pick.winner === homeTeam.teamid ? chosenStyle : {}),
                    }}
                  >
                    <TeamLogo abbrev={homeTeam.abbrev!} height="40px" width="40px" />
                    <Text>{homeTeam.abbrev}</Text>
                  </div>
                </div>
                {pick.score !== null && pick.score !== undefined && pick.score > 0 && (
                  <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                    <Text>Total Score: {pick.score}</Text>
                  </div>
                )}
                {/* {i !== picks.length - 1 && <Hr style={{width: '100%'}} />} */}
              </div>
            );
          })}
          <FuntimeButton href={`https://www.play-funtime.com/league/${league.league_id}/week`}>
            View Week
          </FuntimeButton>
        </div>
      </Container>
    </Html>
  );
}
