import { createClient, Client } from "@libsql/client"
import { DateTime } from "luxon";

const config = {
    url: process.env.DB_URL,
    authToken: process.env.DB_TOKEN
};

/**
 * 
 * @returns {Client}
 */
export function create() {
    const db = createClient(config)
    return db;
}

/**
 * 
 * @param {Client} turso 
 * @returns {Promise<number[]>}
 */
export async function getParticipantIds(turso) {
    const result = await turso.execute("SELECT osu_id FROM participant");
    return result.rows.map((e) => e.osu_id);
}

/**
 * Adds participant to turso.
 * @param {Client} turso
 * @param {number} id
 */
export async function addParticipantId(turso, id) {
    await turso.execute({
        sql: "INSERT INTO `participant`(osu_id) VALUES (?)",
        args: [id]
    });
}

/**
 * 
 * @param {Client} turso 
 * @param {number} id 
 * @param {boolean} visible 
 */
export async function setParticipantVisible(turso, id, visible) {
    await turso.execute({
        sql: "UPDATE `participant` SET visible = ? WHERE osu_id = ?",
        args: [visible ? "true" : "false", id]
    });
}

/**
 * 
 * @param {Client} turso 
 * @param {number} id 
 */
export async function removeParticipantId(turso, id) {
    await turso.execute({
        sql: "DELETE FROM `participant` WHERE osu_id = ?",
        args: [id]
    });
}

/**
 * 
 * @param {Client} turso 
 * @param {string} name 
 * @returns {Promise<number>}
 */
export async function createTeam(turso, name) {
    const result = await turso.execute({
        sql: "INSERT INTO `team`(name) VALUES (?)",
        args: [name]
    });
    return result.lastInsertRowid;
}

/**
 * 
 * @param {Client} turso 
 * @param {number} teamId 
 */
export async function removeTeam(turso, teamId) {
    await turso.execute({
        sql: "DELETE FROM `team` WHERE id = ?",
        args: [teamId]
    });
}

/**
 * 
 * @param {Client} turso 
 * @param {number} osuId 
 * @param {number} teamId 
 */
export async function setParticipantToTeam(turso, osuId, teamId) {
    await turso.execute({
        sql: "UPDATE `participant` SET team_id = ? WHERE osu_id = ?",
        args: [teamId, osuId]
    });
}

/**
 * 
 * @param {Client} turso 
 * @param {number} osuId 
 */
export async function removeParticipantFromTeam(turso, osuId) {
    await turso.execute({
        sql: "UPDATE `participant` SET team_id = NULL WHERE osu_id = ?",
        args: [osuId]
    });
}

/**
 * 
 * @param {Client} turso
 * @returns {Promise<({ token: string, expires_on: DateTime }|null)>} 
 */
export async function getStoredToken(turso) {
    const tursoResult = await turso.execute("SELECT token, expires_on FROM `access_token`");
    if (tursoResult.rows.length === 0) {
        return null;
    }
    const row = tursoResult.rows[0];
    return {
        token: row.token,
        expires_on: DateTime.fromISO(row.expires_on)
    }
}

/**
 * 
 * @param {Client} turso
 * @param {{token: string, expiresOn: DateTime}} tokenResult
 */
export async function storeToken(turso, tokenResult) {
    const now = DateTime.now();
    await turso.batch(
        [
            "DELETE FROM `access_token`",
            {
                sql: "INSERT INTO `access_token`(token, expires_on) VALUES (?, ?)",
                args: [tokenResult.token, tokenResult.expiresOn.toISO()]
            }
        ],
        "write"
    );
}

/**
 * @param {Client} turso 
 * @param {number} osuId
 * @returns {Promise<boolean>} 
 */
export async function userIsParticipant(turso, osuId) {
    const result = await turso.execute({
        sql: "SELECT COUNT(osu_id) AS found FROM `participant` WHERE osu_id = ?",
        args: [osuId]
    })
    const isParticipant = result.rows[0].found === 1
    return isParticipant
}

/**
 * @param {Client} turso
 * @param {number} osuId
 * @returns {Promise<boolean>}
 */
export async function userIsAdmin(turso, osuId) {
    const result = await turso.execute({
        sql: "SELECT COUNT(`osu_id`) AS isadmin FROM `admin` WHERE `osu_id` = ?",
        args: [osuId]
    })
    const isAdmin = result.rows[0].isadmin === 1
    return isAdmin
}

/**
 * 
 * @param {Client} turso
 * @param {string} id
 * @returns {Promise<{id:string,name:string,start:DateTime,end:DateTime}|undefined>}
 */
export async function getTimelineEvent(turso, id) {
    const result = await turso.execute({
        sql: "SELECT name, start_time, end_time FROM `timeline_event` WHERE id = ?",
        args: [id]
    })
    if (result.rows.length === 0) {
        return undefined
    }
    const { name, start_time, end_time } = result.rows[0]
    return {
        id,
        name,
        start: DateTime.fromISO(start_time),
        end: DateTime.fromISO(end_time)
    }
}

/**
 * @param {Client} turso
 * @returns {Promise<{id:string,name:string,start:DateTime,end:DateTime}[]>} 
 */
export async function getTimelineEvents(turso) {
    const result = await turso.execute("SELECT id, name, start_time, end_time FROM `timeline_event` ORDER BY start_time")
    return result.rows.map((row) => {
        const { id, name, start_time, end_time } = row
        return {
            id,
            name,
            start: DateTime.fromISO(start_time),
            end: DateTime.fromISO(end_time)
        }
    })
}

/**
 * @param {Client} turso 
 * @param {string} id
 * @param {{name:string,start:DateTime,end:DateTime}} value  
 */
export async function overrideTimelineEvent(turso, id, value) {
    await turso.execute({
        sql: "INSERT INTO `timeline_event`(id, name, start_time, end_time) VALUES (:id, :name, :start_time, :end_time) ON CONFLICT (id) DO UPDATE SET name = :name, start_time = :start_time, end_time = :end_time WHERE id = :id",
        args: {
            id: id,
            name: value.name,
            start_time: value.start.toISO(),
            end_time: value.end.toISO()
        }
    })
}

/**
 * 
 * @param {Client} turso 
 * @param {string} id
 * @returns {Promise<undefined>} 
 */
export async function removeTimelineEvent(turso, id) {
    await turso.execute({
        sql: "DELETE FROM `timeline_event` WHERE id = ?",
        args: [id]
    });
}
