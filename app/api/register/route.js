import * as Turso from "@/lib/turso"
import * as Upstash from "@/lib/upstash"
import * as Players from "@/lib/players"
import { getServerSession } from "next-auth"
import * as auth from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req) {
    const tursoClient = Turso.create()
    const upstashClient = Upstash.create()
    const session = await getServerSession(auth.config)

    console.log(JSON.stringify(session.data))

    const res = new NextResponse()

    if (session.user === undefined) {
        res.status = 401
        return res
    }

    const playerSearchResult = await Players.getRegisteredPlayers(tursoClient, upstashClient)
    if (playerSearchResult[session.user.id] !== undefined) {
        res.status = 400
        return res
    }

    await Players.registerNewPlayer(tursoClient, session.user.id)

    tursoClient.close()

    res.status = 200
    return res
}