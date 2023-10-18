
import osuProvider from 'next-auth/providers/osu'
import { getServerSession } from "next-auth"

export const config = {
    providers: [
        osuProvider({
            clientId: process.env.OSU_CLIENT_ID,
            clientSecret: process.env.OSU_CLIENT_SECRET,
            authorization: {
                url: "https://osu.ppy.sh/oauth/authorize",
                params: {
                    scope: "identify public",
                },
            },
        }),
    ],
    callbacks: {
        async session({ session, user, token }) {
            if (token?.osu) {
                session.user.id = token.osu.id
                session.user.profile = token.osu
                session.user.is_admin = session.user.id.toString() == process.env.OSU_ADMIN
            }
            return session
        },
        async jwt({ token, user, account, profile, isNewUser }) {
            // console.log(account?.access_token)

            if (account?.provider === "osu") {
                token.osu = {
                    id: profile.id,

                    is_restricted: profile.is_restricted, // only visible to self
                    is_bot: profile.is_bot,
                    is_deleted: profile.is_deleted,

                    country_code: profile.country_code,
                    cover: profile.cover,

                    global_rank: profile.statistics.global_rank,
                }
            }
            return token
        }
    },
}

export async function auth(...args) {
    return getServerSession(...args, config)
}