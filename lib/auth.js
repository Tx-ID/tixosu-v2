
import osuProvider from 'next-auth/providers/osu'
import { getServerSession } from "next-auth"
import * as Turso from "@/lib/turso"

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
        async signIn({ user, account, profile, email, credentials }) {
            if (profile.is_restricted) {
                return false
            }
            return true
        },
        async session({ session, user, token }) {
            const turso = Turso.create()
            if (token?.osu) {
                session.user.id = token.osu.id
                session.user.profile = token.osu
                session.user.is_admin = session.user.id.toString() == process.env.OSU_ADMIN
                session.user.is_participant = await Turso.userIsParticipant(turso, token.osu.id)
            }
            turso.close()
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