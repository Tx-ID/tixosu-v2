import axios from "axios";
import { Redis } from "@upstash/redis/nodejs";
import { getAppClientToken } from "./osu.js"

export const Mods = {
    NM: 1,
    NF: 1, // NF and NM have no differences in difficulty. NF just prevents from failing
    EZ: 2,
    HD: 8,
    HR: 16,
    DT: 64,
    FL: 1024,
}

export async function getBeatmaps(turso, upstash, ...ids) {
    const base_url = "https://osu.ppy.sh/api/v2/beatmaps/"
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${clientToken}`,
    };

    // do axios

}

/**
 * 
 * @param {string} mods 
 * @returns {number}
 */
function parseMods(mods) { // parseMods("HD") parseMods("HDHRDT")
    var bit = 0;
    for (var i = 1; i <= mods.length; i += 2) {
        var sub = mods.substring(i - 1, i + 1)
        var value = Mods[sub] || 0
        bit += value
    }
    return bit;
}

/**
 * 
 * @param {string} clientToken 
 * @param {Redis} upstash 
 * @param {number} id 
 * @param {string} mods 
 * @returns {Promise<{
 * max_combo: number,
 * star_rating: number,
 * aim_difficulty: number,
 * approach_rate: number,
 * flashlight_difficulty: number,
 * overall_difficulty: number,
 * slider_factor: number,
 * speed_difficulty: number
 * }>}
 */
export async function getBeatmapDifficulty(clientToken, upstash, id, mods) {
    // https://osu.ppy.sh/docs/index.html#get-beatmap-attributes

    const url = `https://osu.ppy.sh/api/v2/beatmaps/${id}/attributes`
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${clientToken}`
    };

    const response = await axios.post(
        url,
        {
            "mods": parseMods(mods),
            "ruleset": "osu"
        },
        {
            headers
        }
    );

    return response.data["attributes"];
}