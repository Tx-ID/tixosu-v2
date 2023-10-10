'use client'

import { SessionProvider } from "next-auth/react"
import { redirect } from "next/navigation"
import { useSession } from "next-auth/react"

export default function Template({ children, session }) {
    return <SessionProvider session={session}>
        {children}
    </SessionProvider>
}