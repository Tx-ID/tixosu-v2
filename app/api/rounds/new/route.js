import { getServerSession } from "next-auth";
import * as auth from "@/lib/auth";

import { NextResponse } from "next/server";
import * as rounds from "@/lib/rounds";
import * as turso from "@/lib/data/turso";

export async function POST(req) {
  const session = await getServerSession(auth.config);

  if (!session?.user?.is_admin) {
    return new NextResponse('"Unauthorized"', {
      status: 401,
    });
  }

  const client = turso.create();
  const newRound = await rounds.addRound(client);
  client.close();

  return NextResponse.json(newRound);
}
