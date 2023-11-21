'use client'

import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

import RoundCard from "./card"
import { updateRoundBeatmaps } from "@/lib/rounds";

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

    const [rounds, setRounds] = useState([]); // { ...round, beatmaps: {} }[]
    const [allowChanges, setChanges] = useState(false);
    const [beatmapDatas, setBeatmapDatas] = useState({});
    const [lastBeatmapId, setLastBeatmapId] = useState(0);

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
                beatmaps: (e.beatmaps || []).map(bm => ({
                    ...bm,
                    mods: bm.mod,
                    mod: undefined,
                }))
            })).sort((a, b) => a.zindex > b.zindex);
            setRounds(new_rounds);

            let maxId = 0
            new_rounds.forEach((e) => {
                e.beatmaps.sort((a, b) => a.id < b.id)
                let id = e.beatmaps[0]?.id ?? 0
                maxId = Math.max(id, maxId)
            })
            setLastBeatmapId(maxId)

            return new_rounds;
        },
        refetchOnWindowFocus: false,
    })

    const availableMods = ["NM", "NF", "HD", "HR", "DT", "FM", "TB"];

    const queryBeatmaps = useQuery({
        queryKey: ["read_beatmaps"],
        queryFn: async () => {
            const get_beatmaps = rounds.reduce((array, r) => {
                r.beatmaps.filter(bm => (bm.beatmap_id > 0 && availableMods.includes(bm.mods))).map(bm => {
                    array.push({ beatmap_id: bm.beatmap_id, mods: bm.mods })
                })
                return array;
            }, [])

            const responses = await Promise.all(
                get_beatmaps.map(bm =>
                    axios.post("/api/beatmaps", { BeatmapId: bm.beatmap_id, Mods: bm.mods })
                )
            ).catch(e => {
                console.log(e)
                return "ERROR"
            })

            if (responses === "ERROR") {
                throw new Error("Unable to fetch beatmaps");
            }

            const beatmaps = responses.map(e => e.data)
            return beatmaps
        },
        refetchOnWindowFocus: false,
    })

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
            new_rounds.map((e, index) => {
                e.chosen = undefined
                e.selected = undefined // sortable stuff
                e.beatmaps.map((m, mindex) => {
                    m.chosen = undefined
                    m.selected = undefined
                    m.zindex = mindex + 1
                    return m
                })
                e.zindex = index + 1
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

    const [updateBeatmaps, setUpdateBeatmaps] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (updateBeatmaps) {
                setUpdateBeatmaps(false);
            }
            queryBeatmaps.refetch();
        }, 1000)
        return () => clearTimeout(delayDebounceFn)
    }, [updateBeatmaps, rounds])

    const handleBeatmapIdUpdate = () => {
        setUpdateBeatmaps(true);
    }

    const handleRoundUpdate = (new_round) => {
        var canChange = false;
        const new_rounds = rounds.map((round) => {
            if (round.id === new_round.id) {
                canChange = true;
                return new_round;
            }
            return round;
        });

        setRounds(new_rounds);
        setChanges(canChange);
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
                : <ReactSortable className="flex gap-2 flex-col pb-20" list={rounds} setList={setRounds} onChange={e => setChanges(true)} animation={150} handle=".round-dragger">
                    {rounds.map((round) => (
                        <RoundCard
                            key={round.id}
                            round={round}

                            setChanges={setChanges}
                            onRoundDelete={handleRoundDelete}
                            onRoundUpdate={handleRoundUpdate}
                            onBeatmapIdUpdate={handleBeatmapIdUpdate}
                            lastBeatmapId={lastBeatmapId}
                            setLastBeatmapId={setLastBeatmapId}

                            beatmapsWithAttributes={queryBeatmaps.data}

                            isDeleting={requestDeleteRound.variables === round.id}
                        />
                    ))}
                </ReactSortable>
        }
        <div className="absolute bottom-5 right-0">
            <button className={"btn " + ((allowChanges && requestUpdateRounds.status !== "loading") ? "btn-primary" : "btn-disabled")} onClick={e => requestUpdateRounds.mutate(rounds, {
                onSuccess: () => { queryRounds.refetch(); setChanges(false) }
            })}>{requestUpdateRounds.status === "loading" ? <span className="loading loading-spinner"></span> : "SAVE CHANGES"}</button>
        </div>
    </div>)
}