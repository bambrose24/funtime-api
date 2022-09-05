import moment from "moment";
import { env } from "../config";

export function now(): moment.Moment {
  if (env === "production") {
    return moment();
  }
  // when testing times, add a delta here -- need to build the app before running again for changes to take effect
  return moment();
}
