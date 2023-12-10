import { DateTime } from "luxon";
import * as Turso from "@/lib/turso"
import { Client } from "@libsql/client/.";

/**
 * 
 * @param {import("@libsql/client/.").Client} turso 
 * @param {number} roundId 
 * @returns {boolean}
 */
async function checkRoundData(turso, roundId) {
    return await Turso.verifyRoundExists(turso, roundId)
}

/**
 * @param {Client} turso
 * @returns {Promise<import("@/lib/turso").Round[]>}
*/
export async function getRounds(turso) {
    return await Turso.getRounds(turso)
}

/**
 * @param {Client} turso
 * @returns {Promise<import("@/lib/turso").Round[]>}
*/
export async function getVisibleRounds(turso) {
    return (await Turso.getRounds(turso)).filter((round) => round.visible)
}

/**
 * 
 * @param {Client} turso 
 * @returns {Promise<import("@/lib/turso").RoundBaseData>}
 */
export async function addRound(turso) {
    return await Turso.createRound(turso, {
        date: DateTime.now(),
        bestOf: 3,
        visible: false
    })
}

/**
 * @param {Client} turso
 * @param {number} roundId
 * @param {boolean} visible
 * @returns {Promise<import("@/lib/turso").RoundBaseData>}
 */
export async function setRoundVisible(turso, roundId, visible) {
    await Turso.setRoundVisible(turso, roundId, visible)
    return await Turso.getRound(turso, roundId)
}

/**
 * 
 * @param {Client} turso 
 * @param {import("@/lib/turso").RoundBaseData} round_data 
 * @returns {Promise<import("@libsql/client/.").ResultSet>}
 */
export async function setRoundData(turso, round_data) {
    return await turso.execute({
        sql: "INSERT INTO `round` (id, zindex, name, date, best_of, visible) VALUES (:id, :zindex, :name, :date, :best_of, :visible) ON CONFLICT (id) DO UPDATE SET visible = :visible, name = :name, date = :date, best_of = :best_of, zindex = :zindex WHERE id = :id",
        args: {
            id: round_data.id,
            zindex: round_data.zindex,
            name: round_data.name,
            date: round_data.date,
            best_of: round_data.best_of,
            visible: round_data.visible,
        },
    });
}

/**
 * 
 * @param {Client} turso 
 * @param {number} round_id 
 * @returns {Promise<import("@libsql/client/.").ResultSet[]>}
 */
export async function removeRound(turso, round_id) {
    return await turso.batch([
        {
            sql: "DELETE FROM `round_beatmap` WHERE round_id = ?",
            args: [round_id]
        },
        {
            sql: "DELETE FROM `round` WHERE id = ?",
            args: [round_id]
        }
    ])
}

export async function updateRoundBeatmaps(turso, rounds) {
    await Promise.all(rounds.map(r => {
        setRoundData(turso, r);
        removeBeatmapByRoundId(turso, r.id)
    }))

    const beatmaps = [];
    rounds.map(r => r.beatmaps.map(bm => beatmaps.push(bm)))

    return await Promise.all(beatmaps.map(bm => setBeatmap(turso, bm)))
}

export async function setBeatmap(turso, beatmap_data) {
    return await turso.execute({
        sql: "INSERT INTO `round_beatmap` (id, zindex, beatmap_id, round_id, mod, number) VALUES (:id, :zindex, :beatmap_id, :round_id, :mods, :number) ON CONFLICT (id) DO UPDATE SET zindex = :zindex, beatmap_id = :beatmap_id, round_id = :round_id, number = :number, mod = :mods WHERE id = :id",
        args: {
            id: beatmap_data.id,
            zindex: beatmap_data.zindex,
            beatmap_id: beatmap_data.beatmap_id,
            round_id: beatmap_data.round_id,
            mods: beatmap_data.mods,
            number: beatmap_data.number
        },
    });
}

export async function removeBeatmap(turso, round_bm_id) {
    return await turso.execute({
        sql: "DELETE FROM `round_beatmap` WHERE id = ?",
        args: [round_bm_id]
    })
}

export async function removeBeatmapByRoundId(turso, round_id) {
    return await turso.execute({
        sql: "DELETE FROM `round_beatmap` WHERE round_id = ?",
        args: [round_id]
    })
}