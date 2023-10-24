import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

export default function add({ onSubmit, isLoading }) {
    const [timeline, setTimeline] = useState({
        "id": null,
        "name": null,
        "start": null,
        "end": null,
    })

    // TODO: add validation.

    return (<div className="flex flex-col gap-2">
        <p className="font-bold text-xl text-white">Add Timeline</p>
        <input onChange={(e) => {
            setTimeline({
                ...timeline,
                'id': e.target.value
            })
        }} type="text" className="input placeholder:text-zinc-600 m-0" placeholder="Timeline Id"></input>
        <input onChange={(e) => {
            setTimeline({
                ...timeline,
                'name': e.target.value
            })
        }} type="text" className="input placeholder:text-zinc-600 m-0" placeholder="Timeline Name"></input>
        <div className="flex flex-col gap-0 mt-4">
            <p className="font-bold text-xs px-2">Start Date</p>
            <input onChange={(e) => {
                setTimeline({
                    ...timeline,
                    'start': e.target.value
                })
            }} type="date" className="input placeholder:text-zinc-600"></input>
        </div>
        <div className="flex flex-col gap-0">
            <p className="font-bold text-xs px-2">End Date</p>
            <input onChange={(e) => {
                setTimeline({
                    ...timeline,
                    'end': e.target.value
                })
            }} type="date" className="input placeholder:text-zinc-600"></input>
        </div>
        <button onClick={() => { if (!isLoading) { onSubmit(timeline) } }} className="mt-4 btn bg-primary text-black hover:bg-primary-dark">
            {isLoading === true ? <span className="loading loading-spinner text-black"></span> : "ADD TIMELINE"}
        </button>
    </div>)
}