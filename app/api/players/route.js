import { getServerSession } from "next-auth";
import * as auth from "@/lib/auth.js";
import { NextResponse } from "next/server";
import { getRegisteredPlayers } from "@/lib/players";
import * as Turso from "@/lib/data/turso";
import * as Upstash from "@/lib/data/upstash";

export async function GET(req) {
  const session = await getServerSession(auth.config);

  if (!session?.user?.is_admin) {
    return new NextResponse('"Unauthorized"', {
      status: 401,
    });
  }

  const tursoClient = Turso.create();
  const upstashClient = Upstash.create();

  const players = await getRegisteredPlayers(tursoClient, upstashClient);

  tursoClient.close();

  return NextResponse.json({
    players: players,
  });
}
