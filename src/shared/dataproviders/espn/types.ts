import {z} from 'zod';

const IdSchema = z.object({
  id: z.string(),
});

const LinkSchema = z.object({
  rel: z.array(z.string()),
  href: z.string(),
  text: z.string(),
  isExternal: z.boolean(),
  isPremium: z.boolean(),
});

const AthleteSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  displayName: z.string(),
  shortName: z.string(),
  links: z.array(LinkSchema),
  headshot: z.string(),
  jersey: z.string(),
  position: z.string(),
  team: IdSchema,
});

const ValueSchema = z.object({
  value: z.number(),
});

const RecordSchema = z.object({
  name: z.string(),
  abbreviation: z.string(),
  type: z.string(),
  summary: z.string(),
});

const TeamSchema = z.object({
  id: z.string(),
  uid: z.string(),
  location: z.string(),
  name: z.string(),
  abbreviation: z.string(),
  displayName: z.string(),
  shortDisplayName: z.string(),
  color: z.string(),
  alternateColor: z.string(),
  isActive: z.boolean(),
  venue: IdSchema,
  links: z.array(LinkSchema),
  logo: z.string(),
});

const CompetitorSchema = z.object({
  id: z.string(),
  uid: z.string(),
  type: z.string(),
  order: z.number(),
  homeAway: z.string(),
  team: TeamSchema,
  score: z.string(),
  linescores: z.array(ValueSchema),
  statistics: z.array(z.any()), // Define specific structure if available
  records: z.array(RecordSchema),
});

const YardLineTextSchema = z.object({
  yardLine: z.number(),
  text: z.string(),
});

const DriveSchema = z.object({
  description: z.string(),
  start: YardLineTextSchema,
  timeElapsed: z.object({
    displayValue: z.string(),
  }),
});

const PlayPositionSchema = z.object({
  yardLine: z.number(),
  team: IdSchema,
});

const ProbabilitySchema = z.object({
  tiePercentage: z.number(),
  homeWinPercentage: z.number(),
  awayWinPercentage: z.number(),
  secondsLeft: z.number(),
});

const LastPlaySchema = z.object({
  id: z.string(),
  type: IdSchema,
  text: z.string(),
  scoreValue: z.number(),
  team: IdSchema,
  probability: ProbabilitySchema,
  drive: DriveSchema,
  start: PlayPositionSchema,
  end: PlayPositionSchema,
  statYardage: z.number(),
  athletesInvolved: z.array(AthleteSchema),
});

const SituationSchema = z.object({
  lastPlay: LastPlaySchema,
  down: z.number(),
  yardLine: z.number(),
  distance: z.number(),
  downDistanceText: z.string(),
  shortDownDistanceText: z.string(),
  possessionText: z.string(),
  isRedZone: z.boolean(),
  homeTimeouts: z.number(),
  awayTimeouts: z.number(),
  possession: z.string(),
});

const StatusSchema = z.object({
  clock: z.number(),
  displayClock: z.string(),
  period: z.number(),
  type: z.object({
    id: z.string(),
    name: z.string(),
    state: z.string(),
    completed: z.boolean(),
    description: z.string(),
    detail: z.string(),
    shortDetail: z.string(),
  }),
});

const BroadcastSchema = z.object({
  market: z.string(),
  names: z.array(z.string()),
});

const LeaderDetailSchema = z.object({
  displayValue: z.string(),
  value: z.number(),
  athlete: AthleteSchema,
  team: IdSchema,
});

const LeaderSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  shortDisplayName: z.string(),
  abbreviation: z.string(),
  leaders: z.array(LeaderDetailSchema),
});

const GeoBroadcastSchema = z.object({
  type: IdSchema,
  market: IdSchema,
  media: z.object({
    shortName: z.string(),
  }),
  lang: z.string(),
  region: z.string(),
});

const VenueSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  address: z.object({
    city: z.string(),
    state: z.string(),
  }),
  capacity: z.number(),
  indoor: z.boolean(),
});

const CompetitionSchema = z.object({
  id: z.string(),
  uid: z.string(),
  date: z.string(),
  attendance: z.number(),
  type: IdSchema,
  timeValid: z.boolean(),
  neutralSite: z.boolean(),
  conferenceCompetition: z.boolean(),
  playByPlayAvailable: z.boolean(),
  recent: z.boolean(),
  venue: VenueSchema,
  competitors: z.array(CompetitorSchema),
  notes: z.array(z.any()), // Define specific structure if available
  situation: SituationSchema,
  status: StatusSchema,
  broadcasts: z.array(BroadcastSchema),
  leaders: z.array(LeaderSchema),
  format: z.object({
    regulation: z.object({
      periods: z.number(),
    }),
  }),
  startDate: z.string(),
  geoBroadcasts: z.array(GeoBroadcastSchema),
});

const ESPNEventSchema = z.object({
  id: z.string(),
  uid: z.string(),
  date: z.string(),
  name: z.string(),
  shortName: z.string(),
  season: z.object({
    year: z.number(),
    type: z.number(),
    slug: z.string(),
  }),
  week: z.object({
    number: z.number(),
  }),
  competitions: z.array(CompetitionSchema),
  links: z.array(LinkSchema),
  weather: z.object({
    displayValue: z.string(),
    temperature: z.number(),
    highTemperature: z.number(),
    conditionId: z.string(),
    link: LinkSchema,
  }),
  status: StatusSchema,
});

export const ESPNWeekApiResponseSchema = z.object({
  events: z.array(ESPNEventSchema),
});

export type ESPNWeekApiResponse = z.infer<typeof ESPNWeekApiResponseSchema>;
