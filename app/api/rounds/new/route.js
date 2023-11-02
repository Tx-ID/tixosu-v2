
import { NextResponse } from "next/server";
import * as rounds from "@/lib/rounds";
import * as turso from "@/lib/turso";

export async function POST(req) {
    const client = turso.create();
    const newRound = await rounds.addRound(client);
    client.close();

    return NextResponse.json(newRound);
}

// export async function POST(req) {
//     const body = await req.json()

//     const client = turso.create();
//     await rounds.setRoundData(client, body.id, {
//         name: body.name,
//         order: body.id,
//         date: DateTime.fromISO(body.date),
//         best_of: body.best_of,
//     });
//     client.close();

//     return NextResponse.status(200);
// }