import { getServerSession } from "next-auth"
import osuProvider from 'next-auth/providers/osu'

// You'll need to import and pass this
// to `NextAuth` in `app/api/auth/[...nextauth]/route.ts`
export const config = {
    providers: [
        osuProvider({
            clientId: process.env.OSU_CLIENT_ID,
            clientSecret: process.env.OSU_CLIENT_SECRET,
        }),
    ],
}