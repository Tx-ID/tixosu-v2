import { DateTime } from "luxon";

async function checkRoundData(turso, round_id) {
    return !!(await turso.execute("SELECT * from `round`")).rows.filter((e) => (e.id === round_id))[0];
}

export async function getRounds(turso) {
    const rounds = (await turso.execute("SELECT * from `round`;"))?.rows || [];
    const beatmaps = (await turso.execute("SELECT * from `round_beatmap`;"))?.rows || [];
    return rounds.map((round) => ({
        ...round,
        beatmaps: beatmaps.filter((round_beatmap) => round_beatmap.round_id === round.id),
    }))
}

export async function addRound(turso) {
    const last_id = (await turso.execute("SELECT id FROM round ORDER BY id DESC LIMIT 1"))?.rows[0]?.id || 0;
    const last_zindex = (await turso.execute("SELECT zindex FROM round ORDER BY zindex DESC LIMIT 1"))?.rows[0]?.zindex || 0;

    // i fucking hate sql queries
    // best website ever https://sqliteonline.com

    const new_round_data = {
        id: last_id + 1,
        zindex: last_zindex + 1,
        name: `New Round #${last_id + 1}`,
        date: DateTime.now().toSQLDate(),
        best_of: 3,
    }

    await setRoundData(turso, new_round_data)

    return new_round_data;
}

export async function setRoundData(turso, round_data) {
    return await turso.execute({
        sql: "INSERT INTO `round` (id, zindex, name, date, best_of) VALUES (:id, :zindex, :name, :date, :best_of) ON CONFLICT (id) DO UPDATE SET name = :name, date = :date, best_of = :best_of, zindex = :zindex WHERE id = :id",
        args: {
            id: round_data.id,
            zindex: round_data.zindex,
            name: round_data.name,
            date: round_data.date,
            best_of: round_data.best_of
        },
    });
}

export async function removeRound(turso, round_id) {
    return await Promise.all([
        turso.execute({
            sql: "DELETE FROM `round` WHERE id = ?",
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

export async function updateRoundBeatmaps(turso, beatmaps) {
    const round_ids = beatmaps.reduce((dict, beatmap) => dict[beatmap.round_id] = 1, {}).keys();
    console.log(round_ids)
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