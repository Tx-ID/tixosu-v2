import { DateTime } from "luxon"
import * as Turso from "@/lib/turso"

const REGIST_CLOSE_ID = 'registration_closes';

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
 * @param {DateTime} date 
 */
export async function setRegistrationCloseDate(turso, date) {
    await Turso.overrideTimelineEvent(turso, REGIST_CLOSE_ID, date)
}