import React from 'react';
import {Html} from '@react-email/html';
import {Text} from '@react-email/text';
import {Container} from '@react-email/container';
import {Button} from '@react-email/button';
import moment from 'moment';
import {League} from '@prisma/client';

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
      <Container style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
        <Text>Hi {username},</Text>
        <Text>
          This is a reminder to get your picks in for week {week} for {leagueName}. The week starts
          in {diffString}.
        </Text>
        <Button href={`https://www.play-funtime.com/league/${leagueId}/pick`}>
          Make Your Picks
        </Button>
      </Container>
    </Html>
  );
}
