import * as React from 'react';
import {Html} from '@react-email/html';
import {Text} from '@react-email/text';
import {Container} from '@react-email/container';

type RegistrationEmailProps = {
  username: string;
  email: string;
  leagueName: string;
  superbowl?: {
    superBowlWinner: string; // abbrev
    superBowlLoser: string; // abbrev
    superBowlScore: number;
  };
};

export function RegistrationEmail(props: RegistrationEmailProps) {
  return (
    <Html>
      <Container style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
        <Text>
          Congratulations, {props.username}! You are registered for {props.leagueName}. You'll
          receive emails from this email address with reminders to make picks as well as pick
          confirmations.
        </Text>
        {!props.superbowl ? null : (
          <Text>
            Your Super Bowl Pick is: {props.superbowl.superBowlWinner} defeats{' '}
            {props.superbowl.superBowlLoser}, total score of {props.superbowl.superBowlScore}
          </Text>
        )}
      </Container>
    </Html>
  );
}
