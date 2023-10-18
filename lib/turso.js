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
 * @returns {Promise<boolean>}
 */
export async function addParticipantId(turso, id) {
    
}

export async function setParticipantVisible(turso, id, visible) {
    
}

export async function removeParticipantId(turso, id) {
    
}

export async function createTeam(turso, name) {
    
}

export async function removeTeam(turso, team_id) {
    // removes team from participants if any
}

export async function setParticipantToTeam(turso, osu_id, team_id) {
    
}

export async function removeParticipantFromTeam(turso, osu_id) {
    
}

/**
 * 
 * @param {Client} turso
 * @returns {Promise<({ token: string, expires_on: DateTime }|null)>} 
 */
export async function getStoredToken(turso) {
    const tursoResult = await turso.execute("SELECT token, expires_on FROM access_token");
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
            "DELETE FROM access_token",
            {
                sql: "INSERT INTO access_token(token, expires_on) VALUES (?, ?)",
                args: [tokenResult.token, tokenResult.expiresOn.toISO()]
            }
        ],
        "write"
    );
}