import { getServerSession } from "next-auth";
import * as auth from "@/lib/auth.js";
import { NextResponse } from "next/server";
import { getRegisteredPlayers } from "@/lib/players";

export async function GET(req) {
    const session = await getServerSession(auth.config);

    if (!(session?.user?.is_admin)) {
        return new NextResponse('"Unauthorized"', {
            status: 401
        });
    }

    const players = await getRegisteredPlayers();

    return NextResponse.json({
        players: players
    });
}