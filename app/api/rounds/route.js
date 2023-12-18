export const revalidate = 0;

import { NextResponse } from "next/server";
import * as Rounds from "@/lib/rounds";
import * as Turso from "@/lib/data/turso";

// return all rounds
export async function GET(req) {
  const client = Turso.create();
  const rounds = await Rounds.getRounds(client);
  client.close();

  return NextResponse.json(rounds);
}
