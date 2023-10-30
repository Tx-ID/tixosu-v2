import { Redis } from "@upstash/redis";
import { z } from "zod";

const config = {
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN,
};

/**
 * 
 * @returns {Redis}
 */
export function create() {
    const client = new Redis(config);
    return client;
}

/**
* @param {Redis} upstash
* @param {number[]} ids
* @returns {Promise<Record<number, { 
* osu_id: number, 
* username: string,
* avatar_url: string,
* country_code: string
* }>>}
*/
export async function getCachedPlayers(upstash, ids) {
    const result = await Promise.all(ids.map((id) => upstash.hgetall(id)));
    return result.filter((e) => e !== null).reduce((obj, row) => {
        obj[row.osu_id] = row;
        return obj;
    }, {});
}

/**
 * 
 * @param {Redis} upstash 
 * @param {{
* osu_id: number, 
* username: string,
* avatar_url: string,
* country_code: string
* }[]} data
* @returns {Promise<undefined>}
*/
export async function cachePlayers(upstash, data) {
    await Promise.all(data.map((profile) => upstash.hset(`PROFILE_${profile.osu_id}`, profile)))
}

/**
 * 
 * @param {Redis} upstash 
 * @param {number[]} beatmap_ids 
 * @returns {Promise<Record<number, import("./osu").Beatmap>>}
 */
export async function getCachedBeatmaps(upstash, beatmap_ids) {
    const results = await Promise.all(
        beatmap_ids.map((id) =>
            upstash.hgetall(`BEATMAP_${id}`)
                .then((result) =>
                    result !== null ? [id, result] : null
                )
        ))
    return Object.fromEntries(results.filter((e) => e !== null))
}

/**
 * 
 * @param {Redis} upstash 
 * @param {import("./osu").Beatmap[]} data
 * @returns {Promise<undefined>}
 */
export async function cacheBeatmaps(upstash, data) {
    await Promise.all(data.map((beatmap) => upstash.hset(`BEATMAP_${beatmap.id}`, beatmap)))
}

/**
 * 
 * @param {Redis} upstash 
 * @param {number} beatmapId
 * @param {number} modBitset
 * @returns {Promise<import("./osu").BeatmapDifficultyAttributes | null>}
 */
export async function getCachedBeatmapAttributes(upstash, beatmapId, modBitset) {
    return await upstash.hgetall(`BEATMAP_${beatmapId.toString()}_${modBitset.toString()}`)
}

/**
 * 
 * @param {Redis} upstash 
 * @param {[number, import("./osu").BeatmapDifficultyAttributes][]} data 
 * @returns {Promise<undefined>}
 */
export async function cacheDifficulties(upstash, data) {
    await Promise.all(data.map(([beatmapId, attributes]) => upstash.hset(`BEATMAP_${beatmapId.toString()}_${attributes.modsBitset.toString()}`, attributes)))
}