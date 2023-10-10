'use client'

import Navbar from './navbar.js'
import { SessionProvider } from "next-auth/react"

export default function Template({ children, pageProps }) {
    return <SessionProvider session={pageProps}><Navbar />{children}</SessionProvider>
}