import NextAuth from "next-auth"
import osuProvider from 'next-auth/providers/osu'

const handler = NextAuth({
    providers: [
        osuProvider({
            clientId: process.env.OSU_CLIENT_ID,
            clientSecret: process.env.OSU_CLIENT_SECRET,
        }),
    ],
})

export { handler as GET, handler as POST }