'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

export default function page() {
    return (
        <>
            <h1 className="text-3xl text-white font-bold">Sheets</h1>
            <table className="mt-4 table rounded-lg bg-[#121212]">
                <thead>
                    <tr className="border-dark border-b-2 text-white">
                        <th></th>
                        <th>Name</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-zinc-900">
                        <th className="bg-dark">1</th>
                        <th className="bg-dark">Admin Sheet</th>
                        <th className="bg-dark"><a href="https://google.com" className="underline">https://google.com</a></th>
                    </tr>
                    <tr className="border-zinc-900">
                        <th className="bg-dark">2</th>
                        <th className="bg-dark">Mappools Sheet</th>
                        <th className="bg-dark"><a href="https://google.com" className="underline">https://google.com</a></th>
                    </tr>
                    <tr className="border-zinc-900">
                        <th className="bg-dark">3</th>
                        <th className="bg-dark">Referee Sheet</th>
                        <th className="bg-dark"><a href="https://google.com" className="underline">https://google.com</a></th>
                    </tr>
                    <tr className="border-zinc-900">
                        <th className="bg-dark"></th>
                        <th className="bg-dark"></th>
                        <th className="bg-dark flex flex-col justify-end items-end">
                            <a href="#">
                                <button className="btn btn-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={1.5} className="w-3 h-3 stroke-white">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    <p>Add Sheet</p>
                                </button>
                            </a>
                        </th>
                    </tr>
                    {/* <tr className="border-t-2 border-dark">
                        <th></th>
                        <th></th>
                        <th></th>
                    </tr> */}
                </tbody>
            </table>
        </>
    )
}