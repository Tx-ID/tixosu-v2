
import { NextResponse } from "next/server";
import { DateTime } from "luxon";

import { auth as getUserSession } from "@/lib/auth"

import * as rounds from "@/lib/rounds";
import * as turso from "@/lib/turso";

export async function POST(req, { params }) {
    const { roundId } = params;
    const data = await req.json();

    const session = await getUserSession();
    if (!(session?.user?.is_admin))
        return new NextResponse('"Unauthorized"', { status: 401 });

    const client = turso.create();
    const get_rounds = await rounds.getRounds(client);
    await get_rounds.forEach(async (round, index) => {
        if (round.id === parseInt(roundId)) {
            await rounds.setRoundData(client, {
                ...round,
                visible: data.visible === true,
            })
        }
    })
    client.close();

    return NextResponse.json({ message: DateTime.now().toISO() })
} 