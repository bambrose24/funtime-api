export type WeekSeasonOptions = {
  week: number;
  season: number;
};

export type SeasonOptions = {
  season: number;
};

export type DataProviderGame = {
  id: string;
  homeAbbrev: string;
  awayAbbrev: string;
  week: number;
  season: number;
  startTime: Date;
  endedTime: Date | null;
  homeScore: number;
  awayScore: number;
  status: 'not_started' | 'in_progress' | 'done';
  quarter: number | null;
  secondsInQuarter: number | null;
};
