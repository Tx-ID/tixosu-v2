import * as Turso from "@/lib/turso"
import * as Timeline from "@/lib/timeline/timeline"
import { NextResponse } from "next/server";
import { DateTime } from "luxon";
import { getServerSession } from "next-auth";
import * as auth from "@/lib/auth";

export async function GET(req) {
    const tursoClient = Turso.create()

    const timeline = await Timeline.getTimelineEvents(tursoClient);

    return NextResponse.json({
        'events': timeline.map((e) => ({
            id: e.id,
            name: e.name,
            start: e.start.toISO(),
            end: e.end.toISO()
        }))
    })
}

/**
 * 
 * @param {Request} req 
 */
export async function POST(req) {

    const session = await getServerSession(auth.config)

    if (!(session?.user?.is_admin)) {
        return new NextResponse('"Unauthorized"', {
            status: 401
        });
    }

    const tursoClient = Turso.create()
    const body = await req.json()

    const created = await Timeline.addTimelineEvent(tursoClient, body.id, {
        name: body.name,
        start: DateTime.fromISO(body.start),
        end: DateTime.fromISO(body.end)
    })

    return NextResponse.json({ 'content': "yay" })
}