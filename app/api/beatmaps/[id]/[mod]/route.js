import { NextRequest, NextResponse } from "next/server";
import * as Beatmap from "@/lib/beatmap";
import * as Turso from "@/lib/data/turso";
import * as Upstash from "@/lib/data/upstash";

/**
 *
 * @param {NextRequest} req
 * @param {{ params: {id: number, mod: string} }} arg
 */
export async function GET(req, { params: { id, mod } }) {
  const turso = Turso.create();
  const upstash = Upstash.create();

  const result = await Beatmap.getBeatmapWithDifficultyAttributeSet(
    turso,
    upstash,
    id,
    mod
  );

  turso.close();

  return NextResponse.json(result);
}
