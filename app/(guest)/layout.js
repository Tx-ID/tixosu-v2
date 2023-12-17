import "./globals.css";

import { Lexend } from "next/font/google";
const lexend = Lexend({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <title>Osu Tourney Demo</title>
        <meta property="description" content="" />
        <meta
          property="og:image"
          content="https://cdn.gilcdn.com/ContentMediaGenericFiles/82a932127b036953af37baa6a312bf79-Full.webp"
        />
        <meta
          property="og:description"
          content="Community tournaments without the hassle"
        />
      </head>
      <body
        className={
          "min-h-screen max-w-screen-md m-auto text-default-white " +
          lexend.className
        }
      >
        {children}
      </body>
    </html>
  );
}
