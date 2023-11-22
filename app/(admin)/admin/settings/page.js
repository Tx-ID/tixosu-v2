'use client'

import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DateTime } from "luxon";

export default function page() {

    const queryRounds = useQuery({
        queryKey: ['rounds'],
        queryFn: async () => {
            const response = await axios.get("/api/rounds");
            if (response.status !== 200) {
                throw new Error("Unable to fetch rounds");
            }

            const get_rounds = response.data.map((e) => ({
                ...e,
                date: DateTime.fromISO(e.date),
                beatmaps: (e.beatmaps || []).map(bm => ({
                    ...bm,
                    mods: bm.mod,
                    mod: undefined,
                }))
            })).sort((a, b) => a.zindex > b.zindex);

            return get_rounds;
        },
        refetchOnWindowFocus: false,
    })

    const setRoundVisible = useMutation({
        mutationKey: ["rounds_visible"],
        mutationFn: async () => {

        },
    })

    return (
        <div>
            <h1 className="text-3xl text-white font-bold mb-4 flex flex-row justify-between items-center">
                <p>Settings</p>
            </h1>

            <h3 className="text-xl font-bold mb-4 flex flex-row justify-between items-center">
                <p>Round Management</p>
            </h3>
            <div className="bg-zinc-900 w-fit rounded-lg pb-2">
                <table className="table text-left w-fit">
                    <thead>
                        <tr className="text-white border-0">
                            <td>#</td>
                            <td>Round Name</td>
                            <td className="text-center">Visible</td>
                        </tr>
                    </thead>
                    <tbody>
                        {queryRounds.isLoading
                            ? <tr key={"loading"} className="border-b-0 bg-dark">
                                <td colSpan="6" className="w-96"><span className="loading loading-spinner h-8"></span></td>
                            </tr>
                            : queryRounds.isError
                                ? <tr key={"error"} className="border-b-0 bg-dark">
                                    <td colSpan="6" className="w-96">
                                        <p>Failed to fetch rounds!</p>
                                    </td>
                                </tr>
                                : Object.values(queryRounds.data).length <= 0
                                    ? <tr key={"not found"} className="border-b-0 bg-dark">
                                        <td colSpan="6" className="h-8">
                                            <p>No rounds are found</p>
                                        </td>
                                    </tr>
                                    : queryRounds.data.map((round, index) => (
                                        <tr key={`key_${index}`} className="border-b-0 bg-dark">
                                            <td>{index + 1}</td>
                                            <td>{round.name}</td>
                                            <td>
                                                <div className="form-control flex justify-center flex-row">
                                                    <input type="checkbox" checked={round.visible} className="checkbox w-6 h-6" onChange={() => { }} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}