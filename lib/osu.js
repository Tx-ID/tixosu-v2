import { DateTime } from "luxon";
import axios from "axios";
import turso from "./turso";

/**
 * 
 * @param {number[]} ids 
 * @returns {Promise<Record<number, { id: number, username: string, country_code: string }>>}
 */
export async function getPlayersById(...ids) {

    const db = turso();

    if (ids.length === 0) return {};

    const cachedUsersById = await getCachedPlayers(db, ids);
    const idsToFetch = ids.filter((e) => cachedUsersById[e] === undefined);

    if (idsToFetch.length === 0) {
        return cachedUsersById;
    }
    
    const clientToken = await getAppClientToken();
    const fetchedUsersById = await fetchPlayers(clientToken, idsToFetch);

    await cachePlayers(db, DateTime.now(), Object.values(fetchedUsersById).map((e) => ({...e, osu_id: e.id})));

    return {
        ...fetchedUsersById,
        ...cachedUsersById
    };
}

/**
 * 
 * @param {{ forceRefresh: boolean }} [options] 
 * @returns 
 */
export async function getAppClientToken(options) {
    const db = turso();

    const storedToken = await getStoredToken(db);
    
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
    await db.batch(
        [
            "DELETE FROM access_token",
            {
                sql: "INSERT INTO access_token(token, expires_on) VALUES (?, ?)",
                args: [ token, expires_on.toMillis() ]
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
 * @param {import("@libsql/client/.").Client} db
 * @returns {Promise<({ token: string, expires_on: DateTime }|null)>} 
 */
async function getStoredToken(db) {
    const dbResult = await db.execute("SELECT token, expires_on FROM access_token");
    if (dbResult.rows.length === 0) {
        return null;
    }
    const row = dbResult.rows[0];
    return {
        token: row.token,
        expires_on: DateTime.fromMillis(row.expires_on)
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
            country_code: e.country_code
        };
        return obj;
    }, {});
    return fetchedUsersById;
}

/**
 * @param {import("@libsql/client/.").Client} db 
 * @param {number[]} ids
 * @returns {Promise<Record<number, { 
 * osu_id: number, 
 * username: string,
 * avatar_url: string,
 * country_code: string,
 * last_fetched: DateTime 
 * }>>}
 */
async function getCachedPlayers(db, ids) {
    const dbResult = await db.execute({
        sql: "SELECT osu_id, username, avatar_url, country_code, last_fetched FROM `cache_osu_user` WHERE `osu_id` IN (?)",
        args: [ids.join(", ")]
    });
    return dbResult.rows.reduce((obj, row) => {
        obj[row.osu_id] = {
            ...row,
            last_fetched: DateTime.fromISO(row.last_fetched)
        };
        return obj;
    }, {});
}

/**
 * 
 * @param {import("@libsql/client/.").Client} db 
 * @param {{
 * osu_id: number, 
 * username: string,
 * avatar_url: string,
 * country_code: string
 * }[]} data 
 * @param {DateTime} now
 * @returns {Promise<undefined>}
 */
async function cachePlayers(db, now, data) {
    const nowIso = now.toISO();
    await db.batch([
        {
            sql: "DELETE FROM `cache_osu_user` WHERE `osu_id` IN (?)",
            args: [data.map((e) => e.osu_id).join(", ")]
        },
        ...data.map(({ osu_id, username, avatar_url, country_code }) => ({
            sql: "INSERT INTO `cache_osu_user`(osu_id, username, avatar_url, country_code, last_fetched) VALUES (?, ?, ?, ?, ?)",
            args: [osu_id, username, avatar_url, country_code, nowIso]
        }))
    ],
    "write");
}