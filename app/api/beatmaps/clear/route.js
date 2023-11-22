
import { NextResponse } from "next/server";
import { DateTime } from "luxon";

import { auth as getUserSession } from "@/lib/auth"

import * as rounds from "@/lib/rounds";
import { parseMods } from "@/lib/beatmap";

import * as turso from "@/lib/turso";
import * as upstash from "@/lib/upstash";

export async function POST(req, { params }) {
    const session = await getUserSession();
    if (!(session?.user?.is_admin))
        return new NextResponse('"Unauthorized"', { status: 401 });

    const db_client = turso.create();
    const cache_client = upstash.create();

    const existingIds = [];
    const existingMods = [];
    const get_rounds = await rounds.getRounds(db_client)

    get_rounds.forEach((round) => {
        round.beatmaps.forEach((bm) => {
            if (!existingIds.includes(bm.beatmap_id))
                existingIds.push(bm.beatmap_id);

            let valid_mods = true;
            existingMods.forEach((combination) => {
                if (combination.id === bm.beatmap_id && combination.mods === parseMods(bm.mod))
                    valid_mods = false;
            })
            if (valid_mods)
                existingMods.push({ id: bm.beatmap_id, mods: parseMods(bm.mod) });
        })
    })

    await Promise.all([
        upstash.clearCachedBeatmaps(cache_client, existingIds),
        upstash.clearCachedBeatmapAttributes(cache_client, existingMods)
    ]).catch((e) => {
        console.log(e)
    })

    db_client.close();

    return NextResponse.json({ message: "Amazing work you got there!" });
}