'use client'

import { useMutation, useQuery } from "@tanstack/react-query"
import axios from "axios"
import { delay } from "lodash";

export default function page() {

    const formatter = Intl.NumberFormat("en-US");

    const getPlayersQuery = useQuery({
        queryKey: ['players'],
        queryFn: async () => {
            const response = await axios.get("/api/players");
            if (response.status !== 200) {
                throw new Error("Unable to fetch players");
            }
            return response.data;
        },
        refetchOnWindowFocus: false,
    });

    const removePlayer = useMutation({
        mutationFn: async (userId) => {
            const response = await axios.post(`/api/players/${userId}/delete`);
            if (response.status !== 200) {
                throw new Error("Unable to delete player!");
            }
            return response.data;
        }
    })

    const setPlayerHidden = useMutation({
        mutationFn: async ({ id, hide }) => {
            const response = await axios.post(`/api/players/${id}/${hide ? "show" : "hide"}`);
            if (response.status !== 200) {
                throw new Error("Unable to set player visibility!");
            }
            return {
                id: id,
                hide: hide,
            };
        }
    })

    return (
        <div className="overflow-auto w-fit">
            <h1 className="text-3xl text-white font-bold mb-4 flex flex-row justify-between items-baseline">
                <p>Players</p>
                <button
                    className={"btn btn-neutral btn-xs w-fit " + (getPlayersQuery.isLoading ? "btn-disabled" : "")}
                    onClick={() => {
                        getPlayersQuery.refetch();
                    }}
                >
                    refresh
                </button>
            </h1>
            <div className="bg-zinc-900 w-fit rounded-lg pb-2">
                <table className="table w-fit table-xs">
                    <thead>
                        <tr className="text-white border-0">
                            <td>#</td>
                            <td>Player</td>
                            <td>Rank</td>
                            <td>Country</td>
                            <td></td>
                        </tr>
                    </thead>
                    <tbody>
                        {/* my own genius sometimes scares me. */}
                        {getPlayersQuery.status !== "success"
                            ? <tr key={"loading"} className="border-b-0 bg-dark">
                                <td colSpan="6" className="w-96"><span className="loading loading-spinner h-8"></span></td>
                            </tr>
                            : Object.values(getPlayersQuery.data.players).length > 0
                                ? ""
                                : <tr key={"not found"} className="border-b-0 bg-dark">
                                    <td colSpan="6" className="h-8">
                                        <p>No registered player found!</p>
                                    </td>
                                </tr>
                        }

                        {getPlayersQuery.status !== "success"
                            ? ""
                            : Object.values(getPlayersQuery.data.players).sort((a, b) => (a > b)).map((player, index) => (
                                <tr className={"bg-dark " + ((index + 1) === Object.values(getPlayersQuery.data.players).length ? "border-0" : "")} key={index}>
                                    <td className={"text-center " + (player.visible ? "" : "line-through opacity-30")}>{index + 1}</td>
                                    <td>
                                        <a href={`https://osu.ppy.sh/users/${player.profile.id}`} className="flex items-center gap-2 overflow-x-auto">
                                            <img className={"h-8 w-8 " + (player.visible ? "" : "opacity-30")} src={player.profile.avatar_url} />
                                            <p className={"whitespace-nowrap " + (player.visible ? "" : "line-through opacity-30")}>{player.profile.username}</p>
                                        </a>
                                    </td>
                                    <td><p className={"whitespace-nowrap " + (player.visible ? "" : "line-through opacity-30")}>{"#" + formatter.format(player.profile.rank)}</p></td>
                                    <td><img className={"w-8 mx-auto " + (player.visible ? "" : "opacity-30")} src={`https://osu.ppy.sh/images/flags/${player.profile.country_code}.png`}></img></td>
                                    <td>
                                        <div className="flex flex-row gap-2 items-center justify-center h-max">
                                            <button onClick={async () => {
                                                if (setPlayerHidden.status === "loading") return;
                                                await setPlayerHidden.mutate({ id: player.profile.id, hide: !player.visible }, {
                                                    onSuccess: () => {
                                                        player.visible = !player.visible;
                                                        getPlayersQuery.refetch();
                                                    }
                                                })
                                            }} className={"btn btn-xs " + (player.visible ? "btn-neutral" : "btn-primary")}>{(setPlayerHidden.variables?.id === player.profile.id && setPlayerHidden.status === "loading") ? <span className="loading loading-spinner h-4 w-4"></span> : player.visible ? "HIDE" : "HIDDEN"}</button>
                                            <button onClick={async () => {
                                                if (removePlayer.status === "loading") return;
                                                await removePlayer.mutate(player.profile.id, {
                                                    onSuccess: () => {
                                                        getPlayersQuery.refetch();
                                                    }
                                                });
                                            }} className="btn btn-warning btn-xs">DELETE</button>
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