'use client'

import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

import RoundCard from "./card"

export default function roundsPage() {

    // this state machine will be useful
    // my face rn -> https://img.guildedcdn.com/ContentMediaGenericFiles/40040c95218d999c2a2fc51c33e129d9-Full.webp?w=512&h=272

    // 2023-11-05
    // I fucking hate async
    // YOU ARE NOT ALLOWED TO SET STATE
    // THEN TAKE THAT STATE FOR PARAMETERS
    // ON THE NEXT LINE

    // changeThisState( newValue )
    // uploadThisState()
    // ^^^ THIS IS BROKEN

    // time wasted on async crap: 3 hours.

    const [last_rounds, setLastRounds] = useState([]);
    const [rounds, setRounds] = useState([]); // { ...round, beatmaps: {} }[]
    const [allowChanges, setChanges] = useState(false);

    const queryRounds = useQuery({
        queryKey: ['rounds'],
        queryFn: async () => {
            const response = await axios.get("/api/rounds");
            if (response.status !== 200) {
                throw new Error("Unable to fetch rounds");
            }

            const new_rounds = response.data.map((e) => ({
                ...e,
                date: DateTime.fromISO(e.date),
                beatmaps: e.beatmaps || []
            }))
            setRounds(new_rounds)

            return new_rounds;
        },
        refetchOnWindowFocus: false,
        // refetchOnReconnect: false,
        // refetchOnMount: false,
    })

    useEffect(() => {

    }, [])

    const requestNewRound = useMutation({
        mutationKey: ["new_round"],
        mutationFn: async () => {
            const response = await axios.post("/api/rounds/new");
            if (response.status !== 200) {
                throw new Error("Unable to fetch rounds");
            }
            return response.data;
        }
    })

    const requestDeleteRound = useMutation({
        mutationKey: ["delete_round"],
        mutationFn: async (id) => {
            const response = await axios.post(`/api/rounds/${id}/delete`);
            if (response.status !== 200) {
                throw new Error("Unable to fetch rounds");
            }

            return response.data;
        }
    })

    const requestUpdateRounds = useMutation({
        mutationKey: ["update_rounds"],
        mutationFn: async (new_rounds) => {
            new_rounds.map((e) => {
                e.chosen = undefined
                e.selected = undefined // sortable stuff
                e.beatmaps.map((m) => {
                    m.chosen = undefined
                    m.selected = undefined
                    return m
                })
                return e
            });

            const response = await axios.post(`/api/rounds/update`, new_rounds);
            if (response.status !== 200) {
                throw new Error("Unable to update rounds");
            }
            return response.data;
        }
    })

    //

    const handleRoundUpdate = (new_round) => {
        const new_rounds = rounds.map((round) => {
            if (round.id === new_round.id) {
                return new_round;
            }
            return round;
        });

        setRounds(new_rounds);
        setChanges(true);
    };

    const handleRoundDelete = (round_id) => {
        requestDeleteRound.mutate(round_id, {
            onSettled: () => {
                queryRounds.refetch();
            }
        })
    }

    return (<div className="overflow-auto relative h-full min-w-fit">
        <h1 className="text-3xl text-white font-bold mb-4 flex flex-row justify-between items-center">
            <p>Rounds</p>
            <button
                className={"btn btn-neutral btn-xs w-fit mr-4 " + (requestNewRound.isLoading ? "btn-disabled" : "")}
                onClick={() => {
                    requestNewRound.mutate(null, {
                        onSettled: () => {
                            queryRounds.refetch();
                        }
                    })
                }}
            >
                add round
            </button>
        </h1>

        {(queryRounds.status !== "success")
            ? <div>
                {queryRounds.status === "error" ? "error" : <span className="loading loading-spinner"></span>}
            </div>
            : (rounds.length <= 0)
                ? <div>
                    No one but us chickens!
                </div>
                // : <div className="flex gap-2 flex-col pb-20">
                //     {rounds.map((round) => (
                //         <RoundCard
                //             key={round.id}
                //             round={round}

                //             onChange={setChanges}
                //             onRoundDelete={handleRoundDelete}
                //             onRoundUpdate={handleRoundUpdate}

                //             isDeleting={requestDeleteRound.variables === round.id}
                //         />
                //     ))}
                // </div>
                : <ReactSortable className="flex gap-2 flex-col pb-20" list={rounds} setList={e => setRounds(f => e)} animation={150} handle=".round-dragger">
                    {rounds.map((round) => (
                        <RoundCard
                            key={round.id}
                            round={round}

                            onChange={setChanges}
                            onRoundDelete={handleRoundDelete}
                            onRoundUpdate={handleRoundUpdate}

                            isDeleting={requestDeleteRound.variables === round.id}
                        />
                    ))}
                </ReactSortable>
        }
        <div className="absolute bottom-5 right-0">
            <button className={"btn " + ((allowChanges && !requestUpdateRounds.isLoading) ? "btn-primary" : "btn-disabled")} onClick={e => requestUpdateRounds.mutate(rounds, {
                onSuccess: () => { setChanges(false) }
            })}>SAVE CHANGES</button>
        </div>
    </div>)
}