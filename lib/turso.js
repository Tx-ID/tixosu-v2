import { createClient, Client } from "@libsql/client"
import { DateTime } from "luxon";
import _ from "lodash"; 

const config = {
    url: process.env.DB_URL,
    authToken: process.env.DB_TOKEN
};

/**
 * 
 * @returns {Client}
 */
export function create() {
    if (!config.url || !config.authToken)
        throw new Error("turso.js: Missing DB_URL or DB_TOKEN in environment!");

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

export async function getAllParticipants(turso) {
    const result = await turso.execute("SELECT * FROM participant")
    return result.rows.map((e) => e);
}

export async function getVisibleParticipants(turso) {
    const result = await turso.execute("SELECT * FROM participant")
    return result.rows.map((e) => e).filter((e) => e.visible);
}

/**
 * Adds participant to turso.
 * @param {Client} turso
 * @param {number} id
 */
export async function addParticipantId(turso, id) {
    await turso.execute({
        sql: "INSERT INTO `participant`(osu_id, visible) VALUES (?, ?)",
        args: [id, "true"]
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

/**
 * 
 * @param {Client} turso
 * @param {number} roundId
 * @returns {Promise<boolean>}
 */
export async function verifyRoundExists(turso, roundId) {
    const result = await turso.execute({
        sql: "SELECT COUNT(*) AS found FROM `round` WHERE round_id = ?",
        args: [roundId]
    })
    const roundExists = result.rows[0].found === 1
    return roundExists
}

/**
 * @typedef {{
 * id: number,
 * zindex: number,
 * name: string,
 * date: string,
 * best_of: number,
 * visible: boolean,
 * beatmaps: {
 *  id: number,
 *  zindex: number,
 *  number: number,
 *  mod: string,
 *  round_id: number,
 *  beatmapId: number
 * }[]
 * }} Round 
 */

/**
 * @param {Client} turso
 * @returns {Promise<Round[]>}
 */
export async function getRounds(turso) {
    const result = await turso.execute(
        `
        SELECT round.id AS id, round.zindex AS zindex, round.name AS name, round.date AS date, round.best_of AS best_of, round.visible AS visible,
               round_beatmap.id AS beatmap_id, round_beatmap.beatmap_id AS beatmap_beatmapId, round_beatmap.zindex AS beatmap_zindex, round_beatmap.mod AS beatmap_mod, round_beatmap.number AS beatmap_number
        FROM \`round\` 
        LEFT JOIN \`round_beatmap\` 
        ON round.id = round_beatmap.round_id`)
    return Object.values(_.groupBy(result.rows, (row) => row.id))
        .map((roundRows) => ({
            id: roundRows[0].id,
            zindex: roundRows[0].zindex,
            name: roundRows[0].name,
            date: roundRows[0].date,
            best_of: roundRows[0].best_of,
            visible: roundRows[0].visible,
            beatmaps: roundRows[0].beatmap_id === null 
                ? [] 
                : roundRows.map((row) => ({
                    id: row.beatmap_id,
                    zindex: row.beatmap_zindex,
                    number: row.beatmap_number,
                    mod: row.beatmap_mod,
                    round_id: row.id,
                    beatmap_id: row.beatmap_beatmapId,
                }))
        }))
}