import { DateTime } from "luxon";

async function checkRoundData(turso, round_id) {
    return !!(await turso.execute("SELECT * from `round`")).rows.filter((e) => (e.id === round_id))[0];
}

export async function getRounds(turso) {
    const get_rounds = await turso.execute("SELECT * from `round`;");
    const get_beatmaps = await turso.execute("SELECT * from `round_beatmap`;");

    return get_rounds.rows.map((round) => ({
        ...round,
        beatmaps: get_beatmaps.rows.filter((round_beatmap) => round_beatmap.round_id === round.id)
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
        visible: false,
    }

    await setRoundData(turso, new_round_data)

    return new_round_data;
}

export async function setRoundData(turso, round_data) {
    return await turso.execute({
        sql: "INSERT INTO `round` (id, zindex, name, date, best_of, visible) VALUES (:id, :zindex, :name, :date, :best_of, :visible) ON CONFLICT (id) DO UPDATE SET visible = :visible, name = :name, date = :date, best_of = :best_of, zindex = :zindex WHERE id = :id",
        args: {
            id: round_data.id,
            zindex: round_data.zindex,
            name: round_data.name,
            date: round_data.date,
            best_of: round_data.best_of,
            visible: round_data.visible,
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

export async function updateRoundBeatmaps(turso, rounds) {
    await Promise.all(rounds.map(r => {
        setRoundData(turso, r);
        removeBeatmapByRoundId(turso, r.id)
    }))

    const beatmaps = [];
    rounds.map(r => r.beatmaps.map(bm => beatmaps.push(bm)))

    return await Promise.all(beatmaps.map(bm => setBeatmap(turso, bm)))
}

export async function setBeatmap(turso, beatmap_data) {
    return await turso.execute({
        sql: "INSERT INTO `round_beatmap` (id, zindex, beatmap_id, round_id, mod, number) VALUES (:id, :zindex, :beatmap_id, :round_id, :mods, :number) ON CONFLICT (id) DO UPDATE SET zindex = :zindex, beatmap_id = :beatmap_id, round_id = :round_id, number = :number, mod = :mods WHERE id = :id",
        args: {
            id: beatmap_data.id,
            zindex: beatmap_data.zindex,
            beatmap_id: beatmap_data.beatmap_id,
            round_id: beatmap_data.round_id,
            mods: beatmap_data.mods,
            number: beatmap_data.number
        },
    });
}

export async function removeBeatmap(turso, round_bm_id) {
    return await turso.execute({
        sql: "DELETE FROM `round_beatmap` WHERE id = ?",
        args: [round_bm_id]
    })
}

export async function removeBeatmapByRoundId(turso, round_id) {
    return await turso.execute({
        sql: "DELETE FROM `round_beatmap` WHERE round_id = ?",
        args: [round_id]
    })
}