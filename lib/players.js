import { Client } from "@libsql/client"
import { Redis } from "@upstash/redis/nodejs";
import { getPlayersById } from "./osu";

/**
 * 
 * @param {Client} turso 
 * @param {Redis} upstash
 */
export async function getRegisteredPlayers(turso, upstash) {
    const ids = await getParticipantIds(turso);
    const players = await getPlayersById(turso, upstash, ...ids);
    return players;
}

/**
 * 
 * @param {Client} turso
 * @returns {Promise<number[]>} 
 */
async function getParticipantIds(turso) {
    const result = await turso.execute("SELECT osu_id FROM participant");
    return result.rows.map((e) => e.osu_id);
}