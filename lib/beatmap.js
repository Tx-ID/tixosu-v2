import axios from "axios";
import { Redis } from "@upstash/redis/nodejs";
import * as Osu from "@/lib/data/osu";
import _ from "lodash";
import {
  beatmapDifficultyAttributeSetSchema,
  beatmapSchema,
} from "./data/models";

export const Mods = {
  NM: 1,
  NF: 1, // NF and NM have no differences in difficulty. NF just prevents from failing
  EZ: 2,
  HD: 8,
  HR: 16,
  DT: 64,
  FL: 1024,
};

/**
 * @typedef {{ ar: number, cs: number, od: number, hp: number, totalLength: number, hitLength: number }} BeatmapComputedAttributes
 */

/**
 * @typedef { {bpm: number, cs: number, ar: number, accuracy: number, drain: number, hitLength: number, totalLength: number} } BeatmapComputedAttributesInput
 */

/**
 *
 * @param {import("@libsql/client/.").Client} turso
 * @param {Redis} upstash
 * @param {number} id
 * @param {string} mods
 * @returns {Promise<import("./data/models").BeatmapWithDifficultyAttributeSet>}
 */
export async function getBeatmapWithDifficultyAttributeSet(
  turso,
  upstash,
  id,
  mods
) {
  const modsBitSet = parseMods(mods);
  const clientToken = await Osu.getAppClientToken(turso);
  const beatmapRaw = await Osu.getBeatmap(clientToken, upstash, id);
  const computedAttributes = computeAttributesFromMods(
    {
      ...beatmapRaw,
      hitLength: beatmapRaw.hit_length,
      totalLength: beatmapRaw.total_length,
    },
    modsBitSet
  );
  const beatmap = toBeatmapModel(beatmapRaw);
  const attributes = await Osu.getBeatmapAttributes(
    clientToken,
    upstash,
    id,
    modsBitSet
  ).then((res) =>
    toBeatmapAttributesModel(res, computedAttributes, mods, modsBitSet)
  );
  return {
    ...beatmap,
    ...attributes,
  };
}

/**
 *
 * @param {import("@/lib/data/osu").BeatmapAPIObject} base
 * @returns {import("@/lib/data/models").Beatmap}
 */
function toBeatmapModel(base) {
  return beatmapSchema.parse({
    id: base.id,

    creatorId: base.user_id,
    creator: base.beatmapset.creator,

    title: base.beatmapset.title,
    titleUnicode: base.beatmapset.title_unicode,
    artist: base.beatmapset.artist,
    artistUnicode: base.beatmapset.artist_unicode,
    difficulty: base.version,

    url: base.url,
    covers: base.beatmapset.covers,

    cs: base.cs,
    ar: base.ar,
    accuracy: base.accuracy,
    drain: base.drain,
    hitLength: base.hit_length,
    totalLength: base.total_length,
  });
}

/**
 *
 * @param {import("@/lib/data/osu").BeatmapDifficultyAttributesAPIObject} baseObject
 * @param {BeatmapComputedAttributes} computedAttributes
 * @param {string} mods
 * @param {number} modsBitSet
 * @returns {import("@/lib/data/models").BeatmapDifficultyAttributeSet}
 */
function toBeatmapAttributesModel(
  baseObject,
  computedAttributes,
  mods,
  modsBitSet
) {
  return beatmapDifficultyAttributeSetSchema.parse({
    modsBitSet,
    mods,
    attributes: {
      ...toCamelCaseKeys(baseObject),
      ...computedAttributes,
    },
  });
}

/**
 *
 * @param {BeatmapComputedAttributesInput} base
 * @param {number} modsBitSet
 * @returns {BeatmapComputedAttributes}
 */
function computeAttributesFromMods(base, modsBitSet) {
  let bpm = base.bpm;
  let cs = base.cs;
  let ar = base.ar;
  let od = base.accuracy;
  let hp = base.drain;
  let drain = base.hitLength;
  let length = base.totalLength;
  // EZ
  if (modsBitSet & 2) {
    cs = cs / 2;
    ar = ar / 2;
    od = od / 2;
    hp = hp / 2;
  }
  // if HR
  if (modsBitSet & 16) {
    cs = cap(cs * 1.3, 10);
    ar = cap(ar * 1.4, 10);
    od = cap(od * 1.4, 10);
    hp = cap(hp * 1.4, 10);
  }
  // if DT/NC
  if (modsBitSet & 64 || modsBitSet & 512) {
    if (ar > 5) ar = (1200 - ((1200 - (ar - 5) * 150) * 2) / 3) / 150 + 5;
    else ar = (1800 - ((1800 - ar * 120) * 2) / 3) / 120;
    od = (79.5 - ((79.5 - 6 * od) * 2) / 3) / 6;
    bpm = bpm * 1.5;
    drain = drain / 1.5;
    length = length / 1.5;
  }
  // if HT
  if (modsBitSet & 256) {
    if (ar > 5) ar = (1200 - ((1200 - (ar - 5) * 150) * 4) / 3) / 150 + 5;
    else ar = (1800 - ((1800 - ar * 120) * 4) / 3) / 120;
    od = (79.5 - ((79.5 - 6 * od) * 4) / 3) / 6;
    bpm = bpm * 0.75;
    drain = drain * 1.5;
    length = length * 1.5;
  }

  return {
    ar: roundByTen(ar),
    cs: roundByTen(cs),
    od: roundByTen(od),
    hp: roundByTen(hp),
    totalLength: length,
    hitLength: drain,
  };
}

/**
 *
 * @param {number} number
 * @param {number | undefined} [n=undefined] n
 * @returns {number}
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
 * @returns {number}
 */
function cap(n0, n1) {
  return Math.min(n0, n1);
}

/**
 * @param {Object} obj
 * @returns {Object}
 */
const toCamelCaseKeys = (obj) =>
  _.transform(
    obj,
    (result, value, key) => {
      result[_.camelCase(key)] = value;
    },
    {}
  );

/**
 *
 * @param {string} mods
 * @returns {number}
 */
export function parseMods(mods) {
  // parseMods("HD") parseMods("HDHRDT")
  var bit = 0;
  for (var i = 1; i <= mods.length; i += 2) {
    var sub = mods.substring(i - 1, i + 1);
    var value = Mods[sub] || 0;
    bit += value;
  }
  return bit;
}
