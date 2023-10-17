import { DateTime } from "luxon";
import axios from "axios";
import { Redis } from "@upstash/redis/nodejs";

/**
 * 
 * @param {import("@libsql/client/.").Client} turso
 * @param {Redis} upstash  
 * @param {number[]} ids 
 * @returns {Promise<Record<number, { id: number, username: string, country_code: string }>>}
 */
export async function getPlayersById(turso, upstash, ...ids) {
    if (ids.length === 0) return {};

    const cachedUsersById = await getCachedPlayers(upstash, ids);
    const idsToFetch = ids.filter((e) => cachedUsersById[e] === undefined);

    if (idsToFetch.length === 0) {
        return cachedUsersById;
    }
    
    const clientToken = await getAppClientToken(turso);
    const fetchedUsersById = await fetchPlayers(clientToken, idsToFetch);

    await cachePlayers(upstash, Object.values(fetchedUsersById).map((e) => ({...e, osu_id: e.id})));

    return {
        ...fetchedUsersById,
        ...cachedUsersById
    };
}

/**
 * 
 * @param {import("@libsql/client/.").Client} turso 
 * @param {{ forceRefresh: boolean }} [options] 
 * @returns 
 */
export async function getAppClientToken(turso, options) {
    const storedToken = await getStoredToken(turso);
    
    const refreshNeeded = storedToken === null
        || storedToken.expires_on
        .diffNow('hours')
        .hours
        < 4
        || options?.forceRefresh; 

    if (!refreshNeeded) {
        return storedToken.token;
    }

    const { token, expires_on } = await refreshForNewToken();
    await turso.batch(
        [
            "DELETE FROM access_token",
            {
                sql: "INSERT INTO access_token(token, expires_on) VALUES (?, ?)",
                args: [ token, expires_on.toISO() ]
            }
        ],
        "write"
    );
    return token;
}

/**
 * 
 * @returns {Promise<{ token: string, expires_on: DateTime }>}
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
        expires_on: now.plus({
            seconds: data.expires_in
        })
    }
}

/**
 * 
 * @param {import("@libsql/client/.").Client} turso
 * @returns {Promise<({ token: string, expires_on: DateTime }|null)>} 
 */
async function getStoredToken(turso) {
    const tursoResult = await turso.execute("SELECT token, expires_on FROM access_token");
    if (tursoResult.rows.length === 0) {
        return null;
    }
    const row = tursoResult.rows[0];
    return {
        token: row.token,
        expires_on: DateTime.fromISO(row.expires_on)
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
async function getCachedPlayers(upstash, ids) {
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
async function cachePlayers(upstash, data) {
    await Promise.all(data.map((profile) => upstash.hset(`PROFILE_${profile.osu_id}`, profile)))
}