'use client'

import { DateTime, Duration } from 'luxon';
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

import Modal from "@/app/(admin)/modal.js";
import AddTimelineWindow from "./add-timeline.js"

import { Source_Code_Pro } from "next/font/google"
import { useState } from "react";
const sourceCodePro = Source_Code_Pro({ subsets: ["latin"] })

export default function page() {
    const [modal, setModal] = useState(false)
    const [modalType, setModalType] = useState("add")
    const [selectedTimeline, setSelectedTimeline] = useState()

    const insertTimeline = useMutation({
        mutationFn: async function (timeline) {
            const response = await axios.post("/api/timeline", timeline);
            if (response.status !== 200) {
                throw new Error("Timeline couldn't be added.");
            }
            return true
        }
    })

    const editTimeline = useMutation({
        mutationFn: async function (timeline) {
            return true
        }
    })

    const removeTimeline = useMutation({
        mutationFn: async function (timeline) {
            return true
        }
    })

    const getTimelineEventsQuery = useQuery(
        {
            queryKey: ['events'],
            queryFn: async () => {
                const response = await axios.get("/api/timeline")
                if (response.status !== 200) {
                    throw new Error("Could not retrieve timeline")
                }
                return {
                    ...response.data,
                    events: response.data.events.map((e) => ({
                        ...e,
                        start: DateTime.fromISO(e.start),
                        end: DateTime.fromISO(e.end)
                    }))
                }
            }
        }
    );

    return (
        <>
            <Modal modalVisible={modal} onClick={() => { setModal(false) }}>
                <div className="relative z-20 m-auto flex bg-dark rounded-lg">
                    <div className="p-4 flex flex-col">
                        {modalType === "add"
                            ? <AddTimelineWindow isLoading={insertTimeline.isLoading}
                                submitFn={(timeline) => {
                                    insertTimeline.mutate(timeline, {
                                        onSuccess: () => { getTimelineEventsQuery.refetch() }
                                    })
                                }} />
                            : <>Unknown modal type: {modalType}</>
                        }
                    </div>
                </div>
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
                    {getTimelineEventsQuery.data?.events ? getTimelineEventsQuery.data.events.map((event, index) => (
                        <tr key={index} className="border-zinc-900">
                            <th className={"bg-dark font-normal max-w-[10rem] break-all " + sourceCodePro.className}>{event.id}</th>
                            <th className="bg-dark">{event.name}</th>
                            <th className="bg-dark">{DateTime.fromISO(event.start).toFormat("dd LLL yyyy")}</th>
                            <th className="bg-dark">{DateTime.fromISO(event.end).toFormat("dd LLL yyyy")}</th>
                            <th className="bg-dark"></th>
                            <th className="bg-dark flex justify-end gap-4">
                                <button className="btn ml-auto btn-sm">EDIT</button>
                                <button className="btn btn-sm">DELETE</button>
                            </th>
                        </tr>
                    )) : <tr key={"RAWR"} className="border-zinc-900">
                        <th className={"bg-dark font-normal " + sourceCodePro.className}><span className="loading loading-spinner text-black"></span></th>
                        <th className="bg-dark"></th>
                        <th className="bg-dark"></th>
                        <th className="bg-dark"></th>
                        <th className="bg-dark"></th>
                        <th className="bg-dark"></th>
                    </tr>}
                </tbody>
            </table>
        </>
    )
}