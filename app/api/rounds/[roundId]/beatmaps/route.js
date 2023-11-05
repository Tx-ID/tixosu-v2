
import * as rounds from "@/lib/rounds";
import * as turso from "@/lib/turso"

import { DateTime } from "luxon";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
    const { roundId } = params;
    const body = req.body.json();

    const client = turso.create();
    rounds.updateRoundBeatmaps(client, body.beatmaps);
    client.close();

    return NextResponse.json({ content: DateTime.now().toSeconds() })
}