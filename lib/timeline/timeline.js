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