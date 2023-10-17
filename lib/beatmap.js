import axios from "axios";
import { Redis } from "@upstash/redis/nodejs";
import { getAppClientToken } from "./osu.js"

const Mods = {
    NM: 0,
    NF: 1, // some tournaments enable them by force.
    EZ: 2,
    HD: 8,
    HR: 16,
    DT: 64,
    FL: 1024,
}

export async function getBeatmaps(turso, upstash, ...ids) {
    // use https://osu.ppy.sh/api/v2/beatmaps?ids%5B%5D=1
}

export function parseMods(mods) { // parseMods("HD") parseMods("HDHRDT")
    var bit = 0;
    for (var i = 1; i <= mods.length; i += 2) {
        var sub = mods.substring(i-1, i+1)
        var value = Mods[ sub ] || 0
        bit += value
    }
    return bit;
}

export async function getBeatmapDifficulty(upstash, id, mods) {
    // https://osu.ppy.sh/docs/index.html#get-beatmap-attributes
    const url = `https://osu.ppy.sh/api/v2/beatmaps/${id}/attributes`
    const mods_bit = parseMods(mods);
}