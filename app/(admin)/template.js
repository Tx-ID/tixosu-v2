'use client'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react"
import Link from "next/link";
import { useEffect, useState } from "react"
const queryClient = new QueryClient();

export default function Template({ children, session }) {
  const [page, setPage] = useState(null);

  useEffect(() => {
    const pathname = window.location.pathname;
    setPage(pathname);
  }, [])

  function goToPage(pathname) {
    setPage(pathname);
  }

  const pages = [
    // ["Authorization", "/admin/authorization"],
    // ["Sheets", "/admin/sheets"],
    ["Players", "/admin/registered"],
    ["Teams", "/admin/teams"],
    ["Rounds", "/admin/rounds"],
    ["Timeline", '/admin/timeline'],
  ]

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>
        <div className={"grid grid-cols-6 gap-4 pt-2 h-full"}>
          <div className={"flex flex-col col-span-1"}>
            <Link onClick={() => { goToPage("/") }} href={"/"} key={-1} className={'hover:text-primary transition-colors duration-150 rounded-lg hover:bg-zinc-900 px-4 py-2'}>
              <p className={'font-bold ' + ("/" == page ? "text-primary hover:text-primary" : "")}>
                {"Back"}
              </p>
            </Link>
            <div className="divider my-1"></div>
            {pages.map((pageData, index) => {
              return <Link onClick={() => { goToPage(pageData[1]) }} href={pageData[1]} key={index} className={'hover:text-primary transition-colors duration-150 rounded-lg hover:bg-zinc-900 px-4 py-2 mb-2 ' + (pageData[1] == page ? "bg-zinc-900" : "")}>
                <p className={'break-words ' + (pageData[1] == page ? "text-primary hover:text-primary" : "")}>
                  {pageData[0]}
                </p>
              </Link>
            })}
          </div>
          <div className='col-span-5'>{children}</div>
        </div>
      </SessionProvider>
    </QueryClientProvider>
  )
}