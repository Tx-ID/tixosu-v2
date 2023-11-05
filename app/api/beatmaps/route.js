import { NextRequest, NextResponse } from "next/server";
import * as Beatmap from "@/lib/beatmap"
import * as Osu from "@/lib/osu"
import * as Turso from "@/lib/turso"
import * as Upstash from "@/lib/upstash"

/**
 * 
 * @param {@param {NextRequest} req } req 
 */
export async function GET(req) {
    const body = req.body.json();

    const tursoClient = Turso.create();
    const upstashClient = Upstash.create();

    const beatmap = await Osu.getBeatmapWithAttributes(tursoClient, upstashClient, parseInt(body.BeatmapId), Beatmap.parseMods(body.Mods))
    return NextResponse.json(beatmap)
}