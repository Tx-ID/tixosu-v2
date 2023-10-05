import { getServerSession } from "next-auth";
import * as auth from "@/lib/auth.js";
import { NextResponse } from "next/server";

export async function GET(req) {
    const session = await getServerSession(auth.config);
    
    return NextResponse.json({
        authenticated: !!session,
        session,
    });
}