import { DateTime } from "luxon";
import axios from "axios";
import { Redis } from "@upstash/redis/nodejs";
import * as Upstash from "./upstash";
import * as Turso from "@/lib/data/turso";
import { number, z } from "zod";
import { beatmapDifficultyAttributeSetSchema, beatmapSchema } from "./models";
import _ from "lodash";

const beatmapDifficultyAttributesApiSchema = z.object({
  star_rating: z.coerce.number(),
  max_combo: z.coerce.number(),
  aim_difficulty: z.coerce.number(),
  speed_difficulty: z.coerce.number(),
  speed_note_count: z.coerce.number(),
  flashlight_difficulty: z.coerce.number(),
  slider_factor: z.coerce.number(),
  approach_rate: z.coerce.number(),
  overall_difficulty: z.coerce.number(),
});

const beatmapApiSchema = z.object({
  id: z.coerce.number(),
  user_id: z.coerce.number(),
  version: z.string(),
  bpm: z.coerce.number(),
  drain: z.coerce.number(),
  cs: z.coerce.number(),
  ar: z.coerce.number(),
  accuracy: z.coerce.number(),
  beatmapset: z.object({
    artist: z.string(),
    artist_unicode: z.string(),
    title_unicode: z.string(),
    title: z.string(),
    creator: z.string(),
    covers: z.object({
      cover: z.string(),
      "cover@2x": z.string(),
      card: z.string(),
      "card@2x": z.string(),
      list: z.string(),
      "list@2x": z.string(),
      slimcover: z.string(),
      "slimcover@2x": z.string(),
    }),
  }),
  total_length: z.coerce.number(),
  hit_length: z.coerce.number(),
  url: z.string(),
});

/**
 * @typedef {z.infer<typeof beatmapDifficultyAttributesApiSchema>} BeatmapDifficultyAttributesAPIObject
 */

/**
 * @typedef {z.infer<typeof beatmapApiSchema>} BeatmapAPIObject
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

  await Upstash.cachePlayers(
    upstash,
    Object.values(fetchedUsersById).map((e) => ({ ...e, osu_id: e.id }))
  );

  return {
    ...fetchedUsersById,
    ...cachedUsersById,
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

  const refreshNeeded =
    storedToken === null ||
    storedToken.expiresOn.diffNow("hours").hours < 4 ||
    options?.forceRefresh;

  if (!refreshNeeded) {
    return storedToken.token;
  }

  const tokenResult = await refreshForNewToken();

  await Turso.storeToken(turso, {
    token: tokenResult.token,
    expiresOn: tokenResult.expiresOn,
  });

  return tokenResult.token;
}

/**
 *
 * @returns {Promise<{ token: string, expiresOn: DateTime }>}
 */
async function refreshForNewToken() {
  const endpoint = "https://osu.ppy.sh/oauth/token";
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const { data } = await axios.post(
    endpoint,
    {
      client_id: process.env.OSU_CLIENT_ID,
      client_secret: process.env.OSU_CLIENT_SECRET,
      grant_type: "client_credentials",
      scope: "public",
    },
    {
      headers,
    }
  );

  const now = DateTime.now();

  return {
    token: data.access_token,
    expiresOn: now.plus({
      seconds: data.expires_in,
    }),
  };
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
    Accept: "application/json",
    Authorization: `Bearer ${clientToken}`,
  };
  const users = await Promise.all(
    ids.map((id) =>
      axios
        .get(endpoint(id), {
          headers,
        })
        .then((e) => e.data)
    )
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
 *
 * @param {number} number
 * @param {number | undefined} [n=undefined] n
 * @returns
 */
function roundByTen(number, n = undefined) {
  n = n ?? 1;
  let div = Math.pow(10, n);
  let rounded = Math.round(number * div) / div;
  return rounded;
}

/**
 *
 * @param {number} n0
 * @param {number} n1
 * @returns
 */
function cap(n0, n1) {
  return Math.min(n0, n1);
}

/**
 * @param {import("@libsql/client/.").Client} turso
 * @param {Redis} upstash
 * @param {number} beatmapId
 * @param {number} modsBitset
 * @returns {Promise<import("./models").BeatmapWithDifficultyAttributeSet>}
 */
export async function getBeatmapWithAttributes(
  turso,
  upstash,
  beatmapId,
  modsBitset
) {
  const clientToken = await getAppClientToken(turso);
  const beatmapCacheResult = await Upstash.getCachedBeatmaps(upstash, [
    beatmapId,
  ]);
  const beatmapAttributesCacheResult = await Upstash.getCachedBeatmapAttributes(
    upstash,
    beatmapId,
    modsBitset
  );

  const beatmapCacheMiss = !Object.keys(beatmapCacheResult).some(
    (e) => e == beatmapId
  );
  const beatmapAttributesCacheMiss = beatmapAttributesCacheResult === null;

  let beatmap = beatmapCacheResult[beatmapId];
  let beatmapAttributes = beatmapAttributesCacheResult;
  if (beatmapCacheMiss) {
    beatmap = await fetchBeatmaps(clientToken, [beatmapId]).then(
      (result) => result[0]
    );
    await Upstash.cacheBeatmaps(upstash, [beatmap]);
  }
  if (beatmapAttributesCacheMiss) {
    beatmapAttributes = await fetchBeatmapAttributes(
      clientToken,
      beatmapId,
      modsBitset
    );
    await Upstash.cacheDifficulties(upstash, [[beatmapId, beatmapAttributes]]);
  }

  let bpm = beatmap.bpm;
  let cs = beatmap.cs;
  let ar = beatmap.ar;
  let od = beatmap.accuracy;
  let hp = beatmap.drain;
  let drain = beatmap.hit_length;
  let length = beatmap.total_length;

  // EZ
  if (modsBitset & 2) {
    cs = cs / 2;
    ar = ar / 2;
    od = od / 2;
    hp = hp / 2;
  }
  // if HR
  if (modsBitset & 16) {
    cs = cap(cs * 1.3, 10);
    ar = cap(ar * 1.4, 10);
    od = cap(od * 1.4, 10);
    hp = cap(hp * 1.4, 10);
  }
  // if DT/NC
  if (modsBitset & 64 || modsBitset & 512) {
    if (ar > 5) ar = (1200 - ((1200 - (ar - 5) * 150) * 2) / 3) / 150 + 5;
    else ar = (1800 - ((1800 - ar * 120) * 2) / 3) / 120;
    od = (79.5 - ((79.5 - 6 * od) * 2) / 3) / 6;
    bpm = bpm * 1.5;
    drain = drain / 1.5;
    length = length / 1.5;
  }
  // if HT
  if (modsBitset & 256) {
    if (ar > 5) ar = (1200 - ((1200 - (ar - 5) * 150) * 4) / 3) / 150 + 5;
    else ar = (1800 - ((1800 - ar * 120) * 4) / 3) / 120;
    od = (79.5 - ((79.5 - 6 * od) * 4) / 3) / 6;
    bpm = bpm * 0.75;
    drain = drain * 1.5;
    length = length * 1.5;
  }

  return {
    ...beatmap,
    attributes: {
      ...beatmapAttributes,
      ar: roundByTen(ar),
      cs: roundByTen(cs),
      od: roundByTen(od),
      hp: roundByTen(hp),
      total_length: length,
      hit_length: drain,
    },
  };
}

/**
 *
 * @param {string} clientToken
 * @param {number[]} ids
 * @returns {Promise<import("./models").Beatmap[]>}
 */
async function fetchBeatmaps(clientToken, ids) {
  const url = new URL("https://osu.ppy.sh/api/v2/beatmaps");
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${clientToken}`,
  };

  for (const id of ids) {
    url.searchParams.append("ids[]", id.toString());
  }

  const result = await axios.get(url.toString(), {
    headers,
  });

  return result.data["beatmaps"]
    .map((obj) => beatmapApiSchema.parse(obj))
    .map((obj) =>
      beatmapSchema.parse({
        id: obj.id,

        creatorId: obj.user_id,
        creator: obj.beatmapset.creator,

        title: obj.beatmapset.title,
        titleUnicode: obj.beatmapset.title_unicode,
        artist: obj.beatmapset.artist,
        artistUnicode: obj.beatmapset.artist_unicode,
        difficulty: obj.version,

        url: obj.url,
        covers: obj.beatmapset.covers,

        cs: obj.cs,
        ar: obj.ar,
        accuracy: obj.accuracy,
        drain: obj.drain,
        hitLength: obj.hit_length,
        totalLength: obj.total_length,
      })
    );
}

/**
 * @param {string} clientToken
 * @param {number} id
 * @param {number} modsBitset
 * @returns {Promise<BeatmapDifficultyAttributesAPIObject>}
 */
async function fetchBeatmapAttributes(clientToken, id, modsBitset) {
  const url = new URL(`https://osu.ppy.sh/api/v2/beatmaps/${id}/attributes`);
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${clientToken}`,
  };

  const result = await axios.post(
    url.toString(),
    {
      mods: modsBitset,
      ruleset: "osu",
    },
    { headers }
  );

  return beatmapDifficultyAttributesApiSchema.parse({
    ...result.data["attributes"],
  });
}

/**
 * @param {string} clientToken
 * @param {Redis} upstash
 * @param {number[]} ids
 * @returns {Promise<Record<number, BeatmapAPIObject>>}
 */
export async function getBeatmaps(clientToken, upstash, ids) {
  const cacheResult = await Upstash.getCachedBeatmaps(upstash, ids).then(
    (result) => z.record(z.number(), beatmapApiSchema).parse(result)
  );
  const missingBeatmaps = ids.filter((id) => cacheResult[id] === undefined);
  if (missingBeatmaps.length === 0) {
    return cacheResult;
  }

  const url = new URL("https://osu.ppy.sh/api/v2/beatmaps");
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${clientToken}`,
  };
  for (const id of ids) {
    url.searchParams.append("ids[]", id.toString());
  }

  const result = await axios.get(url.toString(), {
    headers,
  });

  const parsed = z.array(beatmapApiSchema).parse(result.data["beatmaps"]);
  await Upstash.cacheBeatmaps(upstash, parsed);
  const parsedAsRecord = parsed.reduce((obj, next) => {
    obj[next.id] = next;
    return obj;
  }, {});
  return {
    ...cacheResult,
    ...parsedAsRecord,
  };
}

/**
 * @param {string} clientToken
 * @param {Redis} upstash
 * @param {number} id
 * @returns {Promise<BeatmapAPIObject>}
 */
export async function getBeatmap(clientToken, upstash, id) {
  const cacheResult = await Upstash.getCachedBeatmaps(upstash, [id]).then(
    (result) =>
      result[id] !== undefined ? beatmapApiSchema.parse(result[id]) : undefined
  );
  if (cacheResult !== undefined) {
    return cacheResult;
  }

  const url = new URL("https://osu.ppy.sh/api/v2/beatmaps");
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${clientToken}`,
  };
  url.searchParams.append("ids[]", id.toString());

  const result = await axios.get(url.toString(), {
    headers,
  });

  const parsed = beatmapApiSchema.parse(result.data["beatmaps"][0]);
  await Upstash.cacheBeatmaps(upstash, [parsed]);
  return parsed;
}

/**
 *
 * @param {string} clientToken
 * @param {Redis} upstash
 * @param {number} beatmapId
 * @param {number} modsBitSet
 * @returns {Promise<BeatmapDifficultyAttributesAPIObject>}
 */
export async function getBeatmapAttributes(
  clientToken,
  upstash,
  beatmapId,
  modsBitSet
) {
  const cacheResult = await Upstash.getCachedBeatmapAttributes(
    upstash,
    beatmapId,
    modsBitSet
  );
  if (cacheResult !== null) {
    return cacheResult;
  }

  const url = new URL(
    `https://osu.ppy.sh/api/v2/beatmaps/${beatmapId}/attributes`
  );
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${clientToken}`,
  };

  const result = await axios.post(
    url.toString(),
    {
      mods: modsBitSet,
      ruleset: "osu",
    },
    { headers }
  );

  const parsed = beatmapDifficultyAttributesApiSchema.parse(
    result.data["attributes"]
  );
  await Upstash.cacheBeatmapDifficultyAttributes(
    upstash,
    beatmapId,
    modsBitSet,
    parsed
  );
  return parsed;
}
