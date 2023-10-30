import { Redis } from "@upstash/redis";

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
 * @returns {Promise<Record<number, {
 * creator_id: number,
 * creator: string,
 * beatmap_id: number,
 * title: string,
 * artist: string,
 * difficulty: string,
 * }>>}
 */
export async function getCachedBeatmaps(upstash, beatmap_ids) {

}

/**
 * 
 * @param {Redis} upstash 
 * @param {{
 * creator_id: number,
 * creator: string,
 * beatmap_id: number,
 * title: string,
 * artist: string,
 * difficulty: string,
 * }[]} data
 * @returns {Promise<undefined>}
 */
export async function cacheBeatmaps(upstash, data) {

}

/**
 * 
 * @param {Redis} upstash 
 * @param {string[]} difficulty_ids 
 * @returns {Promise<Record<string, {
 * max_combo: number,
 * star_rating: number,
 * aim_difficulty: number,
 * approach_rate: number,
 * flashlight_difficulty: number,
 * overall_difficulty: number,
 * slider_factor: number,
 * speed_difficulty: number
 * }>>}
 */
export async function getCachedDifficulties(upstash, difficulty_ids) {

}

/**
 * 
 * @param {Redis} upstash 
 * @param {{
 * max_combo: number,
 * star_rating: number,
 * aim_difficulty: number,
 * approach_rate: number,
 * flashlight_difficulty: number,
 * overall_difficulty: number,
 * slider_factor: number,
 * speed_difficulty: number
 * }[]} data 
 * @returns {Promise<undefined>}
 */
export async function cacheDifficulties(upstash, data) {

}