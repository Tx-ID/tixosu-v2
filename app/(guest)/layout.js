import './globals.css'

import { Lexend } from 'next/font/google'
const lexend = Lexend({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={"min-h-screen max-w-screen-md m-auto " + lexend.className}>
        {children}
      </body>
    </html>
  )
}
