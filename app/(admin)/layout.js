
import '../(guest)/globals.css'
import { Lexend } from 'next/font/google'
import * as auth from "@/lib/auth.js"
import { redirect } from "next/navigation"

const lexend = Lexend({ subsets: ['latin'] })

export default async function RootLayout({ children }) {
  const session = await auth.auth();
  if (session?.user == undefined) {
    redirect("/")
    return <></>
  }

  return (
    <html lang="en">
      <body className={"min-h-screen max-w-screen-md m-auto " + lexend.className}>
        {children}
      </body>
    </html>
  )
}
