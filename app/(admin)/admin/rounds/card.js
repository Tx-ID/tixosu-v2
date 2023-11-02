
import { DateTime } from "luxon";
import { useState } from "react";
import { ReactSortable } from "react-sortablejs";
import { useMutation } from "@tanstack/react-query";

import BeatmapCard from "./beatmap"

export default function card({ roundData, onChange, onDelete, isDeleting }) {
    const [data, setData] = useState(roundData);
    const [beatmaps, setBeatmaps] = useState([
        { round_id: 1, beatmap_id: 1, mods: "NM", number: 1 },
        { round_id: 1, beatmap_id: 12, mods: "HD", number: 1 },
        { round_id: 1, beatmap_id: 13, mods: "HR", number: 1 },
        { round_id: 1, beatmap_id: 14, mods: "DT", number: 1 },
        { round_id: 1, beatmap_id: 15, mods: "FM", number: 1 },
        { round_id: 1, beatmap_id: 16, mods: "TB", number: 1 },
    ]);

    return <div key={toString(data.id)} className="bg-zinc-900 rounded-lg flex flex-col pt-4 pb-2 gap-4">
        <div className="flex items-center gap-4 w-full px-4 justify-between">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-zinc-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
            </svg>
            <p className="font-bold">#{data.zindex}</p>
            <div className="flex flex-col">
                <label className="label-text text-xs">Name</label>
                <input type='text' className="input input-bordered input-sm" value={data.name} onChange={(e) => {
                    setData({
                        ...data,
                        name: e.target.value,
                    });
                    onChange(true);
                }}></input>
            </div>
            <div className="flex flex-col w-20">
                <label className="label-text text-xs">Best Of</label>
                <input type='number' className="input input-bordered input-sm w-full" value={data.best_of} onChange={(e) => {
                    setData({
                        ...data,
                        best_of: e.target.value,
                    });
                    onChange(true);
                }}></input>
            </div>
            <div className="flex flex-col mr-auto">
                <label className="label-text text-xs">Start Date</label>
                <input type='date' className="input input-bordered input-sm" value={DateTime.fromISO(data.date).toSQLDate()} onChange={(e) => {
                    setData({
                        ...data,
                        date: DateTime.fromISO(e.target.value),
                    });
                    onChange(true);
                }}></input>
            </div>
            <div className="flex items-center">
                <button onClick={() => { onDelete(data.id) }} className={"btn btn-warning btn-sm " + (isDeleting ? "btn-disabled" : "")}>DELETE</button>
            </div>
        </div>

        <div className="bg-dark w-full p-4">
            <ReactSortable className="flex gap-1 flex-col" list={beatmaps} setList={setBeatmaps} animation={150} fallbackOnBody swapThreshold={0.65}>
                {beatmaps.map((bm) => (
                    <BeatmapCard key={bm.beatmap_id} beatmapData={bm} onChange={onChange}></BeatmapCard>
                ))}
            </ReactSortable>
        </div>
    </div>
}