import { DateTime } from "luxon";
import axios from "axios";
import { Redis } from "@upstash/redis/nodejs";
import * as Upstash from "./upstash";
import * as Turso from "./turso";
import { z } from "zod";

const beatmapDifficultyAttributesSchema = z.object({
    starRating: z.number(),
    maxCombo: z.number(),
    aimDifficulty: z.number(),
    speedDifficulty: z.number(),
    speedNoteCount: z.number(),
    flashlightDifficulty: z.number(),
    sliderFactor: z.number(),
    approachRate: z.number(),
    overallDifficulty: z.number()
})

const beatmapSchema = z.object({
    beatmapsetId: z.number(),
    difficultyRating: z.number(),
    id: z.number(),
    mode: z.enum(["osu"]),
    status: z.string(),
    totalLength: z.number(),
    userId: z.number(),
    version: z.string(),
    accuracy: z.number(),
    ar: z.number(),
    bpm: z.number(),
    convert: z.boolean(),
    countCircles: z.number(),
    countSliders: z.number(),
    countSpinners: z.number(),
    cs: z.number(),
    deletedAt: z.nullable(z.unknown()),
    drain: z.number(),
    hitLength: z.number(),
    isScoreable: z.boolean(),
    lastUpdated: z.string(),
    modeInt: z.number(),
    passcount: z.number(),
    playcount: z.number(),
    ranked: z.number(),
    url: z.string(),
    checksum: z.string(),
    beatmapset: z.object({
        artist: z.string(),
        artistUnicode: z.string(),
        covers: z.object(),
        creator: z.string(),
        favouriteCount: z.number(),
        hype: z.nullable(z.unknown()),
        id: z.number(),
        nsfw: z.boolean(),
        offset: z.number(),
        playCount: z.number(),
        previewUrl: z.string(),
        source: z.string(),
        spotlight: z.boolean(),
        status: z.string(),
        title: z.string(),
        titleUnicode: z.string(),
        trackId: z.nullable(z.unknown()),
        userId: z.number(),
        video: z.boolean(),
        bpm: z.number(),
        canBeHyped: z.boolean(),
        discussionEnabled: z.boolean(),
        discussionLocked: z.boolean(),
        isScoreable: z.boolean(),
        ranked: z.number(),
        rankedDate: z.string(),
        storyboard: z.boolean(),
        submittedDate: z.string(),
        tags: z.string(),
    }),
    maxCombo: z.number(),
});

/**
 * @typedef {z.infer<typeof beatmapDifficultyAttributesSchema>} BeatmapDifficultyAttributes
 */

/**
 * @typedef {z.infer<typeof beatmapSchema>} Beatmap
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
            rank: e.statistics ? e.statistics.rank : 0,
            cover_url: e.cover ? e.cover.url : "",

            // is_restricted is only visible if the access_token is the user itself.
            // TODO: prevent them from registering!!!
        };
        return obj;
    }, {});
    return fetchedUsersById;
}

