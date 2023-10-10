import './globals.css'
import Navbar from './navbar.js'

import { Lexend } from 'next/font/google'
const lexend = Lexend({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={"min-h-screen max-w-screen-md m-auto " + lexend.className}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
