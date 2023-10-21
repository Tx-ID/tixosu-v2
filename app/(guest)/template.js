'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Navbar from './navbar.js'
import { SessionProvider } from "next-auth/react"
const queryClient = new QueryClient()

export default function Template({ children, pageProps }) {
    return (
        <QueryClientProvider client={queryClient}>
            <SessionProvider session={pageProps}>
                <Navbar />
                {children}
            </SessionProvider>
        </QueryClientProvider>
    )
}