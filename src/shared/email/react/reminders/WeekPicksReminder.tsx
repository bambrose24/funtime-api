import React from 'react';
import {Html, Text} from '@react-email/components';

import {Container} from '@react-email/container';
import {FuntimeButton} from '../components/FuntimeButton';
import moment from 'moment';

type WeekPicksReminderProps = {
  week: number;
  username: string;
  leagueId: number;
  leagueName: string;
  weekStartTime: Date;
};

export function WeekPicksReminder({
  week,
  username,
  leagueId,
  leagueName,
  weekStartTime,
}: WeekPicksReminderProps) {
  const diffString = moment(weekStartTime).fromNow();
  return (
    <Html>
      <Container
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          paddingTop: '10px',
          paddingBottom: '10px',
        }}
      >
        <Text>Hi {username},</Text>
        <Text>
          This is a reminder to get your picks in for week {week} for {leagueName}. The week starts
          in {diffString}.
        </Text>
        <FuntimeButton href={`https://www.play-funtime.com/league/${leagueId}/pick`}>
          Make Your Picks
        </FuntimeButton>
      </Container>
    </Html>
  );
}
