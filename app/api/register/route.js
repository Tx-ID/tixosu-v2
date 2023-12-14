import * as Turso from "@/lib/data/turso";
import * as Upstash from "@/lib/data/upstash";
import * as Players from "@/lib/players";
import { getServerSession } from "next-auth";
import * as auth from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  const tursoClient = Turso.create();
  const upstashClient = Upstash.create();
  const session = await getServerSession(auth.config);

  if (session.user === undefined) {
    return new NextResponse("Not Authenticated", {
      status: 401,
    });
  }

  const playerSearchResult = await Players.getRegisteredPlayers(
    tursoClient,
    upstashClient
  );
  if (playerSearchResult[session.user.id] !== undefined) {
    return new NextResponse("User Already Registered", {
      status: 400,
    });
  }

  await Players.registerNewPlayer(tursoClient, session.user.id);

  tursoClient.close();

  return new NextResponse("OK", {
    status: 200,
  });
}
