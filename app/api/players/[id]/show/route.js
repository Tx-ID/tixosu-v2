import { getServerSession } from "next-auth";
import * as auth from "@/lib/auth.js";
import { NextResponse } from "next/server";

import * as Players from "@/lib/players";
import * as Turso from "@/lib/turso";
import * as Upstash from "@/lib/upstash";

export async function POST(req, { params }) {
    const { id } = params
    const session = await getServerSession(auth.config);

    if (!(session?.user?.is_admin)) {
        return new NextResponse('"Unauthorized"', {
            status: 401
        });
    }

    const tursoClient = Turso.create();
    await Players.unhidePlayerFromRegistered(tursoClient, id);

    tursoClient.close();

    return NextResponse.json({
        shownId: id
    });
}