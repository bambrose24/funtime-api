import {DataProviderGame, SeasonOptions, WeekSeasonOptions} from './types';

export abstract class NFLDataProvider {
  abstract getGamesByWeek(opts: WeekSeasonOptions): Promise<Array<DataProviderGame>>;
  abstract getGamesBySeason(opts: SeasonOptions): Promise<Array<DataProviderGame>>;
}
