import { DateTime } from "luxon";
import * as Turso from "@/lib/data/turso";

/**
 *
 * @param {import("@libsql/client/.").Client} turso
 * @returns {Promise<import("../data/models").TimelineEvent[]>}
 */
export async function getTimelineEvents(turso) {
  const result = await Turso.getTimelineEvents(turso);
  return result;
}

/**
 *
 * @param {import("@libsql/client/.").Client} turso
 * @param {string} id
 * @returns {Promise<import("../data/models").TimelineEvent | null>}
 */
export async function getTimelineEvent(turso, id) {
  const result = await Turso.getTimelineEvent(turso, id);
  return result;
}

/**
 *
 * @param {import("@libsql/client/.").Client} turso
 * @param {string} id
 * @param {{name:string,start:DateTime,end:DateTime}} details
 * @returns {Promise<import("../data/models").TimelineEvent>}
 */
export async function addTimelineEvent(turso, id, details) {
  const existingEvent = await Turso.getTimelineEvent(turso, id);
  if (existingEvent !== undefined) {
    throw new Error("Event with that id already exists");
  }
  if (!(details.end.toMillis() > details.start.toMillis())) {
    throw new Error("End date must occur after the start date");
  }
  await Turso.overrideTimelineEvent(turso, id, details);
  const created = await Turso.getTimelineEvent(turso, id);
  return created;
}

/**
 *
 * @param {import("@libsql/client/.").Client} turso
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function removeTimelineEvent(turso, id) {
  const existingEvent = await Turso.getTimelineEvent(turso, id);
  if (existingEvent === null) {
    throw new Error("Event with id is not found!");
  }

  await Turso.removeTimelineEvent(turso, id);
  return true;
}
