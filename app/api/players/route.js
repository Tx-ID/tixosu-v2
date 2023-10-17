import { getServerSession } from "next-auth";
import * as auth from "@/lib/auth.js";
import { NextResponse } from "next/server";
import { getRegisteredPlayers } from "@/lib/players";
import turso from "@/lib/turso";
import upstash from "@/lib/upstash";

export async function GET(req) {
    const session = await getServerSession(auth.config);

    if (!(session?.user?.is_admin)) {
        return new NextResponse('"Unauthorized"', {
            status: 401
        });
    }

    const tursoClient = turso();
    const upstashClient = upstash();

    const players = await getRegisteredPlayers(tursoClient, upstashClient);

    return NextResponse.json({
        players: players
    });
}