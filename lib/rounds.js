
import { Client as sqlClient } from "@libsql/client"
import { Redis as redis } from "@upstash/redis/nodejs";
import * as osu from "./osu";
import * as db from "./turso";
import { parseMods } from "./beatmap"
import { round } from "lodash";

async function checkRoundData(turso, round_id) {
    return !!(await turso.execute("SELECT * from `round`")).rows.filter((e) => (e.order === round_id))[0];
}

export async function getRounds(turso) {
    const rounds = await turso.execute("SELECT * from `round`").rows || [];
    const beatmaps = await turso.execute("SELECT * from `round_beatmap`").rows;
    return rounds.map((round) => ({
        ...round,
        beatmaps: beatmaps.filter((round_beatmap) => round_beatmap.round_id === round.order),
    }))
}

export async function setRoundData(turso, round_id, round_data) {
    const dataExists = await checkRoundData(turso, round_id);
    if (dataExists) {
        return await turso.execute({
            sql: "UPDATE `round` SET name = ?, date = ?, best_of = ? WHERE order = ?",
            args: [round_data.name, round_data.date, round_data.best_of],
        });
    }

    return await turso.execute({
        sql: "INSERT INTO `round`(order, name, date, best_of) VALUES (?, ?, ?, ?)",
        args: [round_id, round_data.name, round_data.date, round_data.best_of],
    });
}

export async function removeRound(turso, round_id) {
    return await Promise.all([
        turso.execute({
            sql: "DELETE FROM `round` WHERE order = ?",
            args: [round_id]
        }),
        turso.execute({
            sql: "DELETE FROM `round_beatmap` WHERE round_id = ?",
            args: [round_id]
        }),
    ])
}

async function checkBeatmap(turso, round_id, beatmap_id, mods, index) {
    return !!(await turso.execute("SELECT * from `round_beatmap`")).rows.filter((e) => (e.round_id === round_id && e.beatmap_id === beatmap_id && e.mods === mods && e.index === index))[0];
}

export async function addBeatmap(turso, round_id, beatmap_id, mods, index) {
    const dataExists = await checkRoundData(turso, round_id);
    if (!dataExists)
        throw new Error("You cannot add beatmap without existing round!");

    const bmExists = await checkBeatmap(turso, round_id, beatmap_id, mods, index);
    if (bmExists) {
        return await turso.execute({
            sql: "UPDATE `round_beatmap` SET beatmap_id = ?",
            args: [beatmap_id],
        });
    }

    return await turso.execute({
        sql: "INSERT INTO `round_beatmap`(number, mod, round_id, beatmap_id) VALUES (?, ?, ?, ?)",
        args: [index, mods, round_id, beatmap_id],
    })
}

export async function removeBeatmap(turso, round_id, mods, index) {
    const dataExists = await checkRoundData(turso, round_id);
    if (!dataExists)
        throw new Error("You cannot remove beatmap without existing round!");
}