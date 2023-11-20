
import { getServerSession } from "next-auth";
import * as auth from "@/lib/auth"

import { NextResponse } from "next/server";
import * as rounds from "@/lib/rounds";
import * as turso from "@/lib/turso";
import { DateTime } from "luxon";

export async function POST(req) {
    const session = await getServerSession(auth.config);

    if (!(session?.user?.is_admin)) {
        return new NextResponse('"Unauthorized"', {
            status: 401
        });
    }

    const edited_rounds = await req.json();

    const client = turso.create();
    await rounds.updateRoundBeatmaps(client, edited_rounds)
    client.close();

    return NextResponse.json({ content: DateTime.now().toSeconds() });
}