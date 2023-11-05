
import { NextResponse } from "next/server";
import * as rounds from "@/lib/rounds";
import * as turso from "@/lib/turso";
import { DateTime } from "luxon";

export async function POST(req) {
    const edited_rounds = await req.json();
    console.log(edited_rounds)

    // const client = turso.create();
    // const newRound = await rounds.addRound(client);
    // client.close();

    return NextResponse.json({ content: DateTime.now().toSeconds() });
}