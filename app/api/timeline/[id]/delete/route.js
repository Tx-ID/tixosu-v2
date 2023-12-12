import * as Turso from "@/lib/data/turso";
import * as Timeline from "@/lib/timeline/timeline";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  const { id } = params;

  const tursoClient = Turso.create();
  const event = await Timeline.getTimelineEvent(tursoClient, id);
  if (event === undefined) {
    return new NextResponse("Not Found", {
      status: 404,
    });
  }

  await Timeline.removeTimelineEvent(tursoClient, id);
  return NextResponse.json({
    content: "success!",
  });
}
