'use client'

import { SessionProvider } from "next-auth/react"

export default function Template({ children, pageProps }) {
    return <SessionProvider session={pageProps}>{children}</SessionProvider>
}