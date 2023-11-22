import { DateTime } from "luxon";
import axios from "axios";
import { Redis } from "@upstash/redis/nodejs";
import * as Upstash from "./upstash";
import * as Turso from "./turso";
import { z } from "zod";

const beatmapDifficultyAttributesApiSchema = z.object({
    star_rating: z.number(),
    max_combo: z.number(),
    aim_difficulty: z.number(),
    speed_difficulty: z.number(),
    speed_note_count: z.number(),
    flashlight_difficulty: z.number(),
    slider_factor: z.number(),
    approach_rate: z.number(),
    overall_difficulty: z.number()
})

const beatmapApiSchema = z.object({
    id: z.number(),
    user_id: z.number(),
    version: z.string(),
    bpm: z.number(),
    version: z.string(),
    drain: z.number(),
    cs: z.number(),
    beatmapset: z.object({
        artist: z.string(),
        artist_unicode: z.string(),
        title_unicode: z.string(),
        title: z.string(),
        creator: z.string(),

        covers: z.object({
            "cover": z.string(),
            "cover@2x": z.string(),
            "card": z.string(),
            "card@2x": z.string(),
            "list": z.string(),
            "list@2x": z.string(),
            "slimcover": z.string(),
            "slimcover@2x": z.string(),
        })
    }),
    url: z.string(),
});

/**
 * @typedef {z.infer<typeof beatmapDifficultyAttributesApiSchema>} BeatmapDifficultyAttributesAPIObject
 */

/**
 * @typedef {z.infer<typeof beatmapApiSchema>} BeatmapAPIObject
*/

/**
 * @typedef {{id: number, creatorId: number, creator: string, title: string, artist: string, difficulty: string}} Beatmap
 */

/**
 * @typedef {{modsBitset: number, maxCombo: number, starRating: number, aimDifficulty: number, approachRate: number, flashlightDifficulty: number, overallDifficulty: number, sliderFactor: number, speedDifficulty: number}} BeatmapDifficultyAttributes
 */

/**
 * @typedef {z.mergeTypes<Beatmap, {attributes: BeatmapDifficultyAttributes}>} BeatmapWithDifficultyAttributes
 */

/**
 * @typedef {z.mergeTypes<
 * BeatmapAPIObject, 
 * {attributes: BeatmapDifficultyAttributesAPIObject}
 * } BeatmapWithDifficultyAttributes
 */


/**
 * 
 * @param {import("@libsql/client/.").Client} turso
 * @param {Redis} upstash  
 * @param {number[]} ids 
 * @returns {Promise<Record<number, { id: number, username: string, country_code: string }>>}
 */
export async function getPlayersById(turso, upstash, ...ids) {
    if (ids.length === 0) return {};

    const cachedUsersById = await Upstash.getCachedPlayers(upstash, ids);
    const idsToFetch = ids.filter((e) => cachedUsersById[e] === undefined);

    if (idsToFetch.length === 0) {
        return cachedUsersById;
    }

    const clientToken = await getAppClientToken(turso);
    const fetchedUsersById = await fetchPlayers(clientToken, idsToFetch);

    await Upstash.cachePlayers(upstash, Object.values(fetchedUsersById).map((e) => ({ ...e, osu_id: e.id })));

    return {
        ...fetchedUsersById,
        ...cachedUsersById
    };
}

/**
 * 
 * @param {import("@libsql/client/.").Client} turso 
 * @param {{ forceRefresh: boolean }} [options] 
 * @returns {Promise<string>}
 */
export async function getAppClientToken(turso, options) {
    const storedToken = await Turso.getStoredToken(turso);

    const refreshNeeded = storedToken === null
        || storedToken.expires_on
            .diffNow('hours')
            .hours
        < 4
        || options?.forceRefresh;

    if (!refreshNeeded) {
        return storedToken.token;
    }

    const tokenResult = await refreshForNewToken();

    await Turso.storeToken(turso, {
        token: tokenResult.token,
        expiresOn: tokenResult.expiresOn
    })

    return tokenResult.token;
}

/**
 * 
 * @returns {Promise<{ token: string, expiresOn: DateTime }>}
 */
async function refreshForNewToken() {
    const endpoint = "https://osu.ppy.sh/oauth/token";
    const headers = {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded"
    };

    const { data } = await axios.post(
        endpoint,
        {
            "client_id": process.env.OSU_CLIENT_ID,
            "client_secret": process.env.OSU_CLIENT_SECRET,
            "grant_type": "client_credentials",
            "scope": "public"
        },
        {
            headers
        }
    );

    const now = DateTime.now();

    return {
        token: data.access_token,
        expiresOn: now.plus({
            seconds: data.expires_in
        })
    }
}

/**
 * 
 * @param {string} clientToken
 * @param {number[]} ids 
 * @returns {Promise<Record<number, {
 * id: number,
 * username: string,
 * avatar_url: string,
 * country_code: string
 * }>>}
 */
async function fetchPlayers(clientToken, ids) {
    const endpoint = (id) => `https://osu.ppy.sh/api/v2/users/${id}/osu`;
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${clientToken}`
    };
    const users = await Promise.all(
        ids.map((id) => axios.get(endpoint(id), {
            headers
        }).then((e) => e.data))
    );
    const fetchedUsersById = users.reduce((obj, e) => {
        obj[e.id] = {
            id: e.id,
            username: e.username,
            avatar_url: e.avatar_url,
            country_code: e.country_code,

            badges: e.badges || [],
            rank: e.statistics ? e.statistics.global_rank : 0,
            cover_url: e.cover ? e.cover.url : "",
        };
        return obj;
    }, {});
    return fetchedUsersById;
}

/**
 * @param {Redis} upstash
 * @param {string} clientToken 
 * @param {number} beatmapId
 * @param {number} modsBitset 
 * @returns {Promise<BeatmapWithDifficultyAttributes>}
 */
export async function getBeatmapWithAttributes(turso, upstash, beatmapId, modsBitset) {
    const clientToken = await getAppClientToken(turso)
    const beatmapCacheResult = await Upstash.getCachedBeatmaps(upstash, [beatmapId])
    const beatmapAttributesCacheResult = await Upstash.getCachedBeatmapAttributes(upstash, beatmapId, modsBitset)

    const beatmapCacheMiss = !Object.keys(beatmapCacheResult).some((e) => e == beatmapId)
    const beatmapAttributesCacheMiss = beatmapAttributesCacheResult === null

    let beatmap = beatmapCacheResult[beatmapId]
    let beatmapAttributes = beatmapAttributesCacheResult
    if (beatmapCacheMiss) {
        beatmap = await fetchBeatmaps(clientToken, [beatmapId]).then((result) => result[0])
        await Upstash.cacheBeatmaps(upstash, [beatmap])
    }
    if (beatmapAttributesCacheMiss) {
        beatmapAttributes = await fetchBeatmapAttributes(clientToken, beatmapId, modsBitset)
        await Upstash.cacheDifficulties(upstash, [[beatmapId, beatmapAttributes]])
    }

    return {
        ...beatmap,
        attributes: beatmapAttributes
    }
}

/**
 * 
 * @param {string} clientToken 
 * @param {number[]} ids
 * @returns {Promise<Beatmap[]>} 
 */
async function fetchBeatmaps(clientToken, ids) {
    const url = new URL("https://osu.ppy.sh/api/v2/beatmaps")
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${clientToken}`,
    }

    for (const id of ids) {
        url.searchParams.append("ids[]", id.toString())
    }

    const result = await axios.get(url, {
        headers,
    })

    return (result.data["beatmaps"])
        .map((obj) => beatmapApiSchema.parse(obj))
        .map((obj) => ({
            id: obj.id,

            creator_id: obj.user_id,
            creator: obj.beatmapset.creator,

            title: obj.beatmapset.title,
            title_unicode: obj.beatmapset.title_unicode,
            artist: obj.beatmapset.artist,
            artist_unicode: obj.beatmapset.artist_unicode,
            difficulty: obj.version,

            url: obj.url,
            covers: obj.beatmapset.covers,
        }))
}

/**
 * @param {string} clientToken
 * @param {number} id
 * @param {number} modsBitset
 * @returns {Promise<BeatmapDifficultyAttributes>}  
 */
async function fetchBeatmapAttributes(clientToken, id, modsBitset) {
    const url = new URL(`https://osu.ppy.sh/api/v2/beatmaps/${id}/attributes`)
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${clientToken}`,
    }

    const result = await axios.post(url, {
        "mods": modsBitset,
        "ruleset": "osu"
    }, { headers })

    const apiObject = beatmapDifficultyAttributesApiSchema.parse(result.data["attributes"])

    return {
        modsBitset: modsBitset,
        maxCombo: apiObject.max_combo,
        starRating: apiObject.star_rating,
        aimDifficulty: apiObject.aim_difficulty,
        approachRate: apiObject.approach_rate,
        flashlightDifficulty: apiObject.flashlight_difficulty,
        overallDifficulty: apiObject.overall_difficulty,
        sliderFactor: apiObject.slider_factor,
        speedDifficulty: apiObject.speed_difficulty
    }
}

