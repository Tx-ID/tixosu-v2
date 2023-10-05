import * as auth from '@/lib/auth.js'
import NextAuth from 'next-auth'

const handler = NextAuth(auth.config);
export { handler as GET, handler as POST }