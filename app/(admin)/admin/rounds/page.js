'use client'

import { DateTime } from "luxon";
import { useState } from "react";
import { ReactSortable } from "react-sortablejs";

import RoundCard from "./card"

export default function rounds() {

    // this state machine will be useful
    // my face rn -> https://img.guildedcdn.com/ContentMediaGenericFiles/40040c95218d999c2a2fc51c33e129d9-Full.webp?w=512&h=272
    const [rounds, setRounds] = useState([
        { id: 1, name: "Round of 64", best_of: 9, date: DateTime.fromISO("2023-11-30") },
        { id: 2, name: "Round of 32", best_of: 9, date: DateTime.fromISO("2023-11-30") },
        { id: 3, name: "Quarterfinals", best_of: 9, date: DateTime.fromISO("2023-11-30") },
        { id: 4, name: "Semifinals", best_of: 9, date: DateTime.fromISO("2023-11-30") },
        { id: 5, name: "Finals", best_of: 9, date: DateTime.fromISO("2023-11-30") },
        { id: 6, name: "Grandfinals", best_of: 9, date: DateTime.fromISO("2023-11-30") },
    ])

    const [allowChanges, setChanges] = useState(false);

    return (<div className="overflow-auto relative h-full">
        <h1 className="text-3xl text-white font-bold mb-4">Rounds</h1>
        <ReactSortable className="flex gap-2 flex-col pb-20" list={rounds} setList={setRounds} animation={150} fallbackOnBody swapThreshold={0.65}>
            {rounds.map((round) => (
                <RoundCard key={round.id} roundData={round} onChange={setChanges}></RoundCard>
            ))}
        </ReactSortable>

        <div className="absolute bottom-5 right-0">
            <button className={"btn " + (allowChanges ? "btn-primary" : "btn-disabled")}>SAVE CHANGES</button>
        </div>
    </div>)
}