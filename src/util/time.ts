import moment from "moment";
import { env } from "src/config";

export function now(): moment.Moment {
  if (env === "production") {
    return moment();
  }
  // when testing times, add a delta here
  return moment();
}
