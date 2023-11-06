
import { NextResponse } from "next/server";
import { DateTime } from "luxon";

import * as rounds from "@/lib/rounds";
import * as turso from "@/lib/turso";

// deletes round with its beatmaps
export async function POST(req, { params }) {
    const { roundId } = params;

    const client = turso.create();
    await rounds.removeRound(client, roundId);
    client.close();

    return NextResponse.json({ message: DateTime.now().toISO() })
} 