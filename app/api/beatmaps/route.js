import { NextRequest, NextResponse } from "next/server";
import * as Beatmap from "@/lib/beatmap";
import * as Osu from "@/lib/data/osu";
import * as Turso from "@/lib/data/turso";
import * as Upstash from "@/lib/upstash";

/**
 *
 * @param {@param {NextRequest} req } req
 */
export async function POST(req) {
  const body = await req.json();
  const beatmapId = body?.BeatmapId || 0;
  const mods = body?.Mods || "NM";

  try {
    const tursoClient = Turso.create();
    const upstashClient = Upstash.create();

    const beatmap = await Osu.getBeatmapWithAttributes(
      tursoClient,
      upstashClient,
      parseInt(beatmapId),
      Beatmap.parseMods(mods)
    );
    beatmap.mods = mods;
    beatmap.modsBitSet = Beatmap.parseMods(mods);

    tursoClient.close();

    return NextResponse.json(beatmap);
  } catch (e) {
    console.log(e);
  }
}
