
import { NextResponse } from "next/server";
import * as rounds from "@/lib/rounds";
import * as turso from "@/lib/turso";
import * as upstash from "@/lib/upstash";

import { DateTime } from "luxon";

// return all rounds
export async function GET() {
    const client = turso.create();
    const get_rounds = await rounds.getRounds(client);
    client.close();

    return NextResponse.json(get_rounds);
}

// creates round / edit
export async function POST(req) {
    const body = await req.json()

    const client = turso.create();
    await rounds.setRoundData(client, body.id, {
        name: body.name,
        order: body.id,
        date: DateTime.fromISO(body.date),
        best_of: body.best_of,
    });
    client.close();

    return NextResponse.status(200);
}