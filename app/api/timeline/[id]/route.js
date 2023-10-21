import * as Turso from "@/lib/turso"
import * as Timeline from "@/lib/timeline/timeline"
import { NextResponse } from "next/server"

export async function GET(req, { params }) {
    const { id } = params
    const tursoClient = Turso.create()
    const event = await Timeline.getTimelineEvent(tursoClient, id)
    return NextResponse.json({
        ...event,
        start: event.start.toISO(),
        end: event.end.toISO()
    })
}