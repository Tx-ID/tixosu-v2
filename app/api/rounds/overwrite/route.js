import { NextRequest, NextResponse } from "next/server";
import * as Rounds from "@/lib/rounds";
import * as Turso from "@/lib/data/turso";
import { z } from "zod";
import { roundBeatmapSchema, roundWithBeatmapsSchema } from "@/lib/data/models";

/**
 *
 * @param {NextRequest} req
 * @returns {Promise<NextResponse>}
 */
export async function POST(req) {
  const parseResult = await req
    .json()
    .then((data) =>
      z.object({ rounds: Rounds.roundsOverwriteDataSchema }).safeParse(data)
    );
  if (!parseResult.success) {
    return new NextResponse("Bad Request", {
      status: 400,
    });
  }

  const data = parseResult.data;
  const client = Turso.create();

  await Rounds.overwriteRounds(client, data.rounds);

  client.close();

  return NextResponse.json(data);
}
