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
    const participants = await Turso.getAllParticipants(turso);

    const ids = participants.reduce((arr, e) => {
        arr.push(e.osu_id)
        return arr
    }, []);

    const players = await Osu.getPlayersById(turso, upstash, ...ids);

    const get = participants.map((e) => ({
        ...e,
        visible: e.visible == "true", // L
        profile: Object.values(players).filter((p) => p.id == e.osu_id)[0]
    })); // i love letting someone else do the naming scheme

    return get;
}

/**
 * 
 * @param {Client} turso 
 * @param {number} osuId 
 */
export async function registerNewPlayer(turso, osuId) {
    await Turso.addParticipantId(turso, osuId)
}

/**
 * 
 */
export async function removePlayerFromRegistered(turso, osuId) {
    await Turso.removeParticipantId(turso, osuId)
}

/**
 * 
 */
export async function hidePlayerFromRegistered(turso, osuId) {
    await Turso.setParticipantVisible(turso, osuId, false)
}

/**
 * 
 */
export async function unhidePlayerFromRegistered(turso, osuId) {
    await Turso.setParticipantVisible(turso, osuId, true)
}