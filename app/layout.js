import './globals.css'
import Navbar from './navbar.js'
import "@fontsource/metropolis";

export const metadata = {
  title: 'Rest of Indonesia Tournament',
  description: 'Host is stupid.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen max-w-screen-md m-auto">
        <Navbar />
        {children}
      </body>
    </html>
  )
}
