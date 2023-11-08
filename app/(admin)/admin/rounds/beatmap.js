
import { useEffect, useState } from "react";

const colorMap = {
    'nm': {
        bg: "bg-nomod",
        border: "border-nomod",
    },
    'hd': {
        bg: "bg-color-hidden",
        border: "border-color-hidden",
    },
    'dt': {
        bg: "bg-doubletime",
        border: "border-doubletime",
    },
    'fm': {
        bg: "bg-freemod",
        border: "border-freemod",
    },
    'hr': {
        bg: "bg-hardrock",
        border: "border-hardrock",
    },
    'tb': {
        bg: "bg-tiebreaker",
        border: "border-tiebreaker",
    },
};

export default function beatmapCard({ beatmap, onBeatmapUpdate, onBeatmapDelete, beatmapDataWithAttributes }) {
    const selectedMod = beatmap.mods.toLowerCase();
    const modStyles = colorMap[selectedMod] || {
        bg: "bg-dark",
        border: "border-dark",
    };

    //

    const handleBeatmapZIndexUpdate = (zindex) => {
        onBeatmapUpdate({
            ...beatmap,
            'zindex': zindex,
        });
    }

    const handleBeatmapModsUpdate = (mods) => {
        onBeatmapUpdate({
            ...beatmap,
            'mods': mods,
        });
    }

    const handleBeatmapNumberUpdate = (number) => {
        onBeatmapUpdate({
            ...e,
            "number": number,
        });
    }

    const handleBeatmapIdUpdate = (beatmap_id) => {
        onBeatmapUpdate({
            ...beatmap,
            'beatmap_id': Math.max(0, parseInt(beatmap_id)),
        });
    }

    return <div key={beatmap.id} className={"rounded-lg flex flex-col gap-4 bg-opacity-10 " + modStyles.bg + " " + modStyles.border + " " + (!beatmapDataWithAttributes ? "p-2" : "")}>
        <div className="flex items-center gap-4 w-full px-4 justify-between">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-[24px] h-[24px] map-dragger">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
            </svg>
            <div className="flex flex-col w-20">
                <label className="label-text text-xs">Mods</label>
                <input type="text" className="input input-bordered input-sm" value={beatmap.mods} onChange={(e) => handleBeatmapModsUpdate(e.target.value)}></input>
            </div>
            <div className="flex flex-col w-20">
                <label className="label-text text-xs">Number</label>
                <input type='number' className="input input-bordered input-sm" value={beatmap.number} onChange={(e) => handleBeatmapNumberUpdate(e.target.value)}></input>
            </div>
            <div className="flex flex-col w-32">
                <label className="label-text text-xs">Beatmap Id</label>
                <input type='number' className="input input-bordered input-sm" value={beatmap.beatmap_id} onChange={(e) => handleBeatmapIdUpdate(e.target.value)}></input>
            </div>
            {!beatmapDataWithAttributes
                ? <span className="w-full py-4 px-4"><p>invisible label</p></span>
                : <div className="w-full flex flex-col text-left relative py-4 px-4">
                    <label className="label-text font-bold z-10 truncate">{beatmapDataWithAttributes.title} [{beatmapDataWithAttributes.difficulty}]</label>
                    <div className="label-text text-xs text-zinc-500 z-10">artist <b className="text-neutral-content">{beatmapDataWithAttributes.artist}</b> <a href={"https://osu.ppy.sh/u/" + beatmapDataWithAttributes.creator_id}>mapper <b className="text-neutral-content">{beatmapDataWithAttributes.creator}</b></a></div>
                    <div className="absolute left-0 top-0 w-full h-full z-0"><img className="h-full w-full object-cover brightness-[20%]" src={beatmapDataWithAttributes.covers.cover}></img></div>
                </div>
            }
            <div className="flex items-center">
                <button
                    onClick={e => onBeatmapDelete(beatmap.id)}
                    className="btn btn-neutral btn-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
}