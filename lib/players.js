import { Client } from "@libsql/client"
import { Redis } from "@upstash/redis/nodejs";
import * as Osu from "./osu";
import * as Turso from "./turso";

/**
 * 
 * @param {Client} turso 
 * @param {Redis} upstash
 */
export async function getRegisteredPlayers(turso, upstash) {
    const ids = await Turso.getParticipantIds(turso);
    const players = await Osu.getPlayersById(turso, upstash, ...ids);
    return players;
}
