
import { DateTime } from "luxon";
import { ReactSortable } from "react-sortablejs";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import BeatmapCard from "./beatmap"

export default function card({ round, onRoundUpdate, onRoundDelete, isDeleting }) {
    const handleRoundNameUpdate = (name) => {
        onRoundUpdate({
            ...round,
            name: name,
        });
    }

    const handleRoundBOUpdate = (best_of) => {
        onRoundUpdate({
            ...round,
            best_of: best_of,
        });
    }

    const handleRoundDateUpdate = (date) => {
        onRoundUpdate({
            ...round,
            date: date,
        });
    }

    //

    const handleMapZIndexUpdate = (new_beatmaps) => {
        onRoundUpdate({ ...round, beatmaps: new_beatmaps.map((beatmap, index) => ({ ...beatmap, zindex: index + 1 })) });
    }

    const handleMapUpdate = (new_map) => {
        const updated_maps = round.beatmaps.map((beatmap) => {
            if (beatmap.id === new_map.id) {
                return new_map;
            }
            return beatmap;
        });
        onRoundUpdate({ ...round, beatmaps: updated_maps });
    };

    const handleMapCreate = () => {
        const newMapId = round.beatmaps.length > 0 ? Math.max(...round.beatmaps.map((map) => map.id)) + 1 : 1;
        const newZIndex = round.beatmaps.length > 0 ? Math.max(...round.beatmaps.map((map) => map.zindex)) + 1 : 1;

        const newMap = {
            id: newMapId,
            zindex: newZIndex,
            number: 1,
            mods: "",
            round_id: round.id,
            beatmap_id: 0,
        };

        onRoundUpdate({
            ...round,
            beatmaps: [...round.beatmaps, newMap]
        })
    };

    const handleMapDelete = (id) => {
        const updated_maps = round.beatmaps.filter((map) => map.id !== id);

        onRoundUpdate({
            ...round,
            beatmaps: updated_maps,
        })
    };

    // console.log(round)

    return <div key={toString(round.id)} className={"bg-zinc-900 rounded-lg flex flex-col pt-4 gap-4 " + (round.beatmaps.length <= 0 ? "pb-4" : "pb-2")}>
        <div className="flex items-center gap-4 w-full px-4 justify-between">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-zinc-700 round-dragger">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
            </svg>
            <p className="font-bold">#{round.zindex}</p>
            <div className="flex flex-col">
                <label className="label-text text-xs">Name</label>
                <input type='text' className="input input-bordered input-sm" value={round.name} onChange={(e) => handleRoundNameUpdate(e.target.value)}></input>
            </div>
            <div className="flex flex-col w-20">
                <label className="label-text text-xs">Best Of</label>
                <input type='number' className="input input-bordered input-sm w-full" value={round.best_of} onChange={(e) => handleRoundBOUpdate(e.target.value)}></input>
            </div>
            <div className="flex flex-col mr-auto">
                <label className="label-text text-xs">Start Date</label>
                <input type='date' className="input input-bordered input-sm" value={DateTime.fromISO(round.date).toSQLDate()} onChange={(e) => handleRoundDateUpdate(DateTime.fromISO(e.target.value))}></input>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleMapCreate} className={"btn btn-neutral btn-sm"}>ADD BEATMAP</button>
                <button onClick={e => onRoundDelete(round.id)} className={"btn btn-warning btn-sm " + (isDeleting ? "btn-disabled" : "")}>DELETE</button>
            </div>
        </div>

        {round.beatmaps.length <= 0 ? "" :
            <div className="bg-dark w-full p-4">
                <ReactSortable className="flex gap-1 flex-col" list={round.beatmaps} setList={handleMapZIndexUpdate} animation={150} fallbackOnBody swapThreshold={0.65} direction={"vertical"} handle=".map-dragger">
                    {round.beatmaps.map((beatmap, index) => (
                        <BeatmapCard
                            key={index}

                            beatmap={beatmap}
                            onBeatmapUpdate={handleMapUpdate}
                            onBeatmapDelete={handleMapDelete}
                        />
                    ))}
                </ReactSortable>

                {/* <div className="flex gap-1 flex-col">
                    {round.beatmaps.map((beatmap, index) => (
                        <BeatmapCard
                            key={index}

                            beatmap={beatmap}
                            onBeatmapUpdate={handleMapUpdate}
                            onBeatmapDelete={handleMapDelete}
                        />
                    ))}
                </div> */}
            </div>
        }
    </div>
}