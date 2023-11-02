'use client'

import { DateTime } from "luxon";
import { useState } from "react";
import { ReactSortable } from "react-sortablejs";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

import RoundCard from "./card"

export default function rounds() {

    // this state machine will be useful
    // my face rn -> https://img.guildedcdn.com/ContentMediaGenericFiles/40040c95218d999c2a2fc51c33e129d9-Full.webp?w=512&h=272

    const [rounds, setRounds] = useState([
        // { id: 1, name: "Round of 64", best_of: 9, date: DateTime.fromISO("2023-11-30") },
    ])

    const queryRounds = useQuery({
        queryKey: ['rounds'],
        queryFn: async () => {
            const response = await axios.get("/api/rounds");
            if (response.status !== 200) {
                throw new Error("Unable to fetch rounds");
            }

            response.data.map((e) => ({
                ...e,
                date: DateTime.fromISO(e.date),
            }))

            setRounds(response.data);
            return response.data;
        },
    })

    const newRound = useMutation({
        mutationKey: ["new_round"],
        mutationFn: async () => {
            const response = await axios.post("/api/rounds/new");
            if (response.status !== 200) {
                throw new Error("Unable to fetch rounds");
            }

            return response.data;
        }
    })

    const deleteRound = useMutation({
        mutationKey: ["delete_round"],
        mutationFn: async (id) => {
            const response = await axios.post(`/api/rounds/${id}/delete`);
            if (response.status !== 200) {
                throw new Error("Unable to fetch rounds");
            }

            return response.data;
        }
    })

    const [allowChanges, setChanges] = useState(false);

    return (<div className="overflow-auto relative h-full min-w-fit">
        <h1 className="text-3xl text-white font-bold mb-4 flex flex-row justify-between items-center">
            <p>Rounds</p>
            <button className={"btn btn-neutral btn-xs w-fit mr-4 " + (newRound.isLoading ? "btn-disabled" : "")} onClick={() => {
                newRound.mutate(null, {
                    onSettled: () => {
                        queryRounds.refetch();
                    }
                })
            }}>add round</button>
        </h1>

        {(queryRounds.status !== "success")
            ? <div>
                {queryRounds.status === "error" ? "error" : <span className="loading loading-spinner"></span>}
            </div>
            : (rounds.length <= 0)
                ? <div>
                    No one but us chickens!
                </div>
                : <ReactSortable className="flex gap-2 flex-col pb-20" list={rounds} setList={setRounds} animation={150} fallbackOnBody swapThreshold={0.65}>
                    {rounds.map((round) => (
                        <RoundCard
                            key={round.id}
                            roundData={round}
                            onChange={setChanges}
                            onDelete={(id) => {
                                deleteRound.mutate(id, {
                                    onSettled: () => {
                                        queryRounds.refetch();
                                    }
                                })
                            }}
                            isDeleting={deleteRound.variables === round.id}
                        />
                    ))}
                </ReactSortable>
        }


        <div className="absolute bottom-5 right-0">
            <button className={"btn " + (allowChanges ? "btn-primary" : "btn-disabled")}>SAVE CHANGES</button>
        </div>
    </div>)
}