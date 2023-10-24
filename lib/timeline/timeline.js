import { DateTime } from "luxon"
import * as Turso from "@/lib/turso"

/**
 * 
 * @param {import("@libsql/client/.").Client} turso 
 * @returns {Promise<{id:string,name:string,start:DateTime,end:DateTime}[]>}
 */
export async function getTimelineEvents(turso) {
    const result = await Turso.getTimelineEvents(turso)
    return result
}

/**
 * 
 * @param {import("@libsql/client/.").Client} turso 
 * @param {Promise<{id:string,name:string,start:DateTime,end:DateTime}} date 
 */
export async function getTimelineEvent(turso, id) {
    const result = await Turso.getTimelineEvent(turso, id)
    return result
}

/**
 * 
 * @param {import("@libsql/client/.").Client} turso 
 * @param {string} id 
 * @param {{name:string,start:DateTime,end:DateTime}} details 
 * @returns {Promise<{id:string,name:string,start:DateTime,end:DateTime}>}
 */
export async function addTimelineEvent(turso, id, details) {
    const existingEvent = await Turso.getTimelineEvent(turso, id)
    if (existingEvent !== undefined) {
        throw new Error('Event with that id already exists')
    }
    if (!(details.end.toMillis() > details.start.toMillis())) {
        throw new Error('End date must occur after the start date')
    }
    await Turso.overrideTimelineEvent(turso, id, details)
    const created = await Turso.getTimelineEvent(turso, id)
    return created
}

export async function removeTimelineEvent(turso, id) {
    const existingEvent = await Turso.getTimelineEvent(turso, id)
    if (!existingEvent) {
        throw new Error('Event with id is not found!')
    }

    await Turso.removeTimelineEvent(turso, id)
    return true;
}