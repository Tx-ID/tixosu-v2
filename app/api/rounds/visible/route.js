export const revalidate = 0;

import { NextResponse } from "next/server";
import * as rounds from "@/lib/rounds";
import * as turso from "@/lib/turso";

// return all rounds
export async function GET(req) {
    const client = turso.create();
    const get_rounds = await rounds.getRounds(client);
    client.close();

    return NextResponse.json(get_rounds.filter((round) => round.visible === true));
}