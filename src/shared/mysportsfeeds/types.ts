import { ObjectType, registerEnumType } from "type-graphql";

export enum MSFGamePlayedStatus {
  UNPLAYED = "UNPLAYED",
  LIVE = "LIVE",
  COMPLETED = "COMPLETED",
  COMPLETED_PENDING_REVIEW = "COMPLETED_PENDING_REVIEW",
}

registerEnumType(MSFGamePlayedStatus, {
  name: "MSFGamePlayedStatus",
  description: "Status of the game",
});

@ObjectType()
export class MSFGameSchedule {
  id: number;
  week: number;
  awayTeam: { id: number; abbreviation: string };
  homeTeam: { id: number; abbreviation: string };

  startTime: string; // ISO string

  endedTime: string | null;
  venueAllegiance: "HOME" | "AWAY" | "NEUTRAL";
  playedStatus: MSFGamePlayedStatus;
}

@ObjectType()
export class MSFGameScore {
  currentQuarter: number | null;
  currentQuarterSecondsRemaining: number | null;
  currentIntermission: string;
  awayScoreTotal: number | null;
  homeScoreTotal: number | null;
}

@ObjectType()
export class MSFGame {
  schedule: MSFGameSchedule;
  score: MSFGameScore;
}
