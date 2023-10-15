'use client'

import { useQuery } from "@tanstack/react-query"
import axios from "axios"

export default function page() {

    const getPlayersQuery = useQuery(
        {
            queryKey: ['players'],
            queryFn: async () => {
                const response = await axios.get("/api/players");
                if (response.status !== 200) {
                    throw new Error("Unable to fetch players");
                }
                return response.data;
            } 
        }
    );

    return (
        <div className="overflow-x-auto">
            {
                getPlayersQuery.status !== "success" 
                ? <h1>Loading</h1> 
                : (
                <table className="table">
                    <thead>
                        <tr>
                            <td>
                                Player
                            </td>
                            <td>
                                Pic
                            </td>
                            <td>
                                Country
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        { Object.values(getPlayersQuery.data.players).map((player) => (
                            <tr>
                                <td>
                                    {player.username}
                                </td>
                                <td>
                                    <img src={player.avatar_url} />
                                </td>
                                <td>
                                    {player.country_code}
                                </td>
                            </tr>
                        )) }
                    </tbody>
                </table>
            )
            }
        </div>
    )
}