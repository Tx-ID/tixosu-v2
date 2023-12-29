import { NextResponse } from "next/server";
import { getPublicParticipants } from "@/lib/players";
import * as Turso from "@/lib/data/turso";
import * as Upstash from "@/lib/data/upstash";

export async function GET(req) {
  const tursoClient = Turso.create();
  const upstashClient = Upstash.create();

  const participants = await getPublicParticipants(tursoClient, upstashClient);

  tursoClient.close();

  return NextResponse.json({
    participants,
  });
}
