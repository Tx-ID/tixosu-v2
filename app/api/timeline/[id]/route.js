import * as Turso from "@/lib/data/turso";
import * as Timeline from "@/lib/timeline/timeline";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { id } = params;
  const tursoClient = Turso.create();
  const event = await Timeline.getTimelineEvent(tursoClient, id);
  if (event === undefined) {
    return new NextResponse("Not Found", {
      status: 404,
    });
  }
  return NextResponse.json({
    ...event,
    start: event.start.toISO(),
    end: event.end.toISO(),
  });
}
