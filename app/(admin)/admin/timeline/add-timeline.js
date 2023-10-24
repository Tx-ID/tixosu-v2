import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";

export default function add({ submitFn, isLoading }) {
    const [timeline, setTimeline] = useState({
        "id": "",
        "name": "",
        "start": "",
        "end": "",
    })

    const [timelineValid, setValid] = useState(false)
    useEffect(() => {
        setValid(timeline.id != "" && timeline.name != "" && timeline.start != "" && timeline.end != "")
    }, [timeline])

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
        <button onClick={() => { if (!isLoading && timelineValid) { submitFn(timeline) } }} className={"mt-4 btn " + (isLoading || !timelineValid ? "bg-slate-700 hover:bg-slate-700 text-slate-900" : "bg-primary hover:bg-primary-dark text-black") + " "}>
            {!timelineValid
                ? "INVALID DATA"
                : isLoading === true
                    ? <span className="loading loading-spinner text-black"></span>
                    : "ADD TIMELINE"}
        </button>
    </div>)
}