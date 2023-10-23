'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { DateTime, Duration } from 'luxon';

export default function page() {
    return (
        <>
            <h1 className="text-3xl text-white font-bold">Sheets</h1>
            <table className="mt-4 table rounded-lg bg-[#121212]">
                <thead>
                    <tr className="border-dark border-b-2 text-white">
                        <th></th>
                        <th>Id</th>
                        <th>Name</th>
                        <th>Start</th>
                        <th>End</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-zinc-900">
                        <th className="bg-dark">1</th>
                        <th className="bg-dark">registration</th>
                        <th className="bg-dark">Registraton</th>
                        <th className="bg-dark">{DateTime.fromISO("2020-01-01").toString()}</th>
                        <th className="bg-dark">{DateTime.fromISO("2024-01-01").toString()}</th>
                    </tr>
                    <tr className="border-zinc-900">
                        <th className="bg-dark"></th>
                        <th className="bg-dark"></th>
                        <th className="bg-dark"></th>
                        <th className="bg-dark"></th>
                        <th className="bg-dark flex flex-col justify-end items-end">
                            <a href="#">
                                <button className="btn btn-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={1.5} className="w-3 h-3 stroke-white">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    <p>Add Timeline</p>
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