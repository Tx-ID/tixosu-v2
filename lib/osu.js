import { DateTime } from "luxon";
import axios from "axios";
import { Redis } from "@upstash/redis/nodejs";
import * as Upstash from "./upstash";
import * as Turso from "./turso";

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
