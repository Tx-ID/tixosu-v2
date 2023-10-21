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