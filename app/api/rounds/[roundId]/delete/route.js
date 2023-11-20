
import { NextResponse } from "next/server";
import { DateTime } from "luxon";

import { getServerSession } from "next-auth";
import * as auth from "@/lib/auth"

import * as rounds from "@/lib/rounds";
import * as turso from "@/lib/turso";

// deletes round with its beatmaps
export async function POST(req, { params }) {
    const { roundId } = params;

    const session = await getServerSession(auth.config);
    if (!(session?.user?.is_admin)) {
        return new NextResponse('"Unauthorized"', {
            status: 401
        });
    }

    const client = turso.create();
    await rounds.removeRound(client, roundId);
    client.close();

    return NextResponse.json({ message: DateTime.now().toISO() })
} 