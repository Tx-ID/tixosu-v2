'use client'

import Link from "next/link"

export default function Home() {
  return (
    <div className="mx-2 flex flex-col items-start">
      <a href="/callback">request Cookie</a>
    </div>
  )
}
