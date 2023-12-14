import { DateTime } from "luxon";
import { z } from "zod";

export const intoLuxonDateTime = () =>
  z
    .custom<DateTime>((obj) => DateTime.isDateTime(obj))
    .or(z.string().transform((str) => DateTime.fromISO(str)));
