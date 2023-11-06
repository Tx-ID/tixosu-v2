
import { NextResponse } from "next/server";
import * as rounds from "@/lib/rounds";
import * as turso from "@/lib/turso";
import { DateTime } from "luxon";

export async function POST(req) {
    const edited_rounds = await req.json();

    const client = turso.create();
    await rounds.updateRoundBeatmaps(client, edited_rounds)
    client.close();

    return NextResponse.json({ content: DateTime.now().toSeconds() });
}