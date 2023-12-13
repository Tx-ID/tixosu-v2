import { NextRequest, NextResponse } from "next/server";
import * as Beatmap from "@/lib/beatmap";
import * as Osu from "@/lib/data/osu";
import * as Turso from "@/lib/data/turso";
import * as Upstash from "@/lib/data/upstash";

/**
 *
 * @param {NextRequest} req
 * @param {{ params: {id: number, mod: string} }} arg
 */
export async function GET(req, { params }) {
  const turso = Turso.create();
  const upstash = Upstash.create();

  const result = await Beatmap.getBeatmapWithDifficultyAttributeSet(
    turso,
    upstash,
    params.id,
    params.mod
  );

  turso.close();

  return NextResponse.json(result);
  // const beatmap = await Osu.getBeatmapWithAttributes(
  //   turso,
  //   upstash,
  //   params.id,
  //   Beatmap.parseMods(params.mod)
  // );

  // turso.close();

  // return NextResponse.json({
  //   ...beatmap,
  //   mods: params.mod,
  //   modsBitSet: Beatmap.parseMods(params.mod),
  // });
}
