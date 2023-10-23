import * as Turso from "@/lib/turso"
import * as Timeline from "@/lib/timeline/timeline"
import { NextResponse } from "next/server";

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