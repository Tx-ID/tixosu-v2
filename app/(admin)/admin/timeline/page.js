'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { DateTime, Duration } from 'luxon';
import Link from "next/link";

import Modal from "@/app/(admin)/modal.js";

import { Source_Code_Pro } from "next/font/google"
import { useState } from "react";
const sourceCodePro = Source_Code_Pro({ subsets: ["latin"] })

export default function page() {
    const [modal, setModal] = useState(true)

    return (
        <>
            <Modal modalVisible={modal} onClick={() => { setModal(false) }}>
                <p>Hello World AAAAAAAAAAAAAAAAAAAAAA</p>
            </Modal>
            <div className="flex flex-row justify-between w-full">
                <h1 className="text-3xl text-white font-bold">Sheets</h1>
                <button onClick={(e) => { setModal(true) }} className="btn btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={1.5} className="w-3 h-3 stroke-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <p>Add Timeline</p>
                </button>
            </div>

            <table className="mt-4 table rounded-lg bg-[#121212]">
                <thead>
                    <tr className="border-dark border-b-2 text-white">
                        <th>Id</th>
                        <th>Name</th>
                        <th>Start</th>
                        <th>End</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-zinc-900">
                        <th className={"bg-dark font-normal " + sourceCodePro.className}>registration</th>
                        <th className="bg-dark">Registration</th>
                        <th className="bg-dark">{DateTime.fromISO("2020-01-01").toFormat("dd LLL yyyy")}</th>
                        <th className="bg-dark">{DateTime.fromISO("2024-01-01").toFormat("dd LLL yyyy")}</th>
                        <th className="bg-dark">
                            <Link href={'#'} className="btn btn-sm">EDIT</Link>
                        </th>
                        <th className="bg-dark">
                            <Link href={'#'} className="btn btn-sm">DELETE</Link>
                        </th>
                    </tr>
                    <tr className="border-zinc-900">
                        <th className="bg-dark"></th>
                        <th className="bg-dark"></th>
                        <th className="bg-dark"></th>
                        <th className="bg-dark"></th>
                        <th className="bg-dark"></th>
                        <th className="bg-dark"></th>
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