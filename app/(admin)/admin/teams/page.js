'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

import { ReactSortable } from "react-sortablejs";
import Modal from "@/app/(admin)/modal";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

function PlayerCard({ key, index, localMember, onUpdate, onDelete, participants, overlappingParticipants }) {

}

function TeamCard({ key, index, localTeam, onUpdate, onDelete, participants, overlappingParticipants }) {
    return (<div>
        <p>{localTeam.name}</p>
    </div>)
}

export default function page() {

    // member: {osu_id: number, index: number}
    // team: {id: number, name: string, index: number, members: [member, ...]}
    const [lastTeams, setLastTeams] = useState([]);
    const [localTeams, setLocalTeams] = useState([]);

    function newLocalTeam() {
        return {
            id: undefined,
            index: undefined,
            name: "New Team",
            visible: true,
            members: [],

            _id: Math.max(localTeams.map((e) => e._id) ?? 0) + 1,
        }
    }

    const [canSave, setCanSave] = useState(false);

    // participantIds: {number, ...}
    const participantIds = [];

    // overlappingParticipants: {number, ...}
    const overlappingParticipants = localTeams.reduce((array, team) => {
        team.members.forEach(member => {
            const memberId = member.id;
            if (participantIds.includes(memberId)) {
                array.push(memberId);
            } else {
                participantIds.push(memberId);
            }
        });
        return array;
    }, []);

    const getTeamsQuery = useQuery({
        queryKey: ["get_teams"],
        queryFn: async () => {
            // setLocalTeams once.
            return [];
        },

        refetchOnWindowFocus: false,
    });
    const getParticipantsQuery = useQuery({
        queryKey: ["players"],
        queryFn: async () => {
            return [];
        },

        refetchOnWindowFocus: false,
    });

    const isLoading = getTeamsQuery.isLoading || getParticipantsQuery.isLoading;
    const teamsSortable = localTeams.map((e) => ({
        ...e,
        _id: e.id,
    }))

    return (
        <div className="overflow-auto">
            <h1 className="text-3xl text-white font-bold mb-4 flex flex-row justify-between items-baseline gap-2">
                <p>Teams</p>
                <div className="flex flex-row gap-2">
                    <button
                        className={"btn btn-neutral btn-xs w-fit" + (isLoading ? " btn-disabled" : "")}
                        onClick={() => {
                            setLocalTeams([...localTeams, newLocalTeam()]);
                            setCanSave(true);
                        }}
                    >
                        new team
                    </button>
                    <button
                        className={"btn btn-neutral btn-xs w-fit" + (isLoading ? " btn-disabled" : "")}
                        onClick={() => { }}
                    >
                        participant to teams
                    </button>
                </div>
            </h1>
            <div className="flex justify-center">
                {isLoading
                    ? <span className="loading loading-spinner h-8"></span>
                    : <div>
                        <ReactSortable
                            className="flex gap-1 flex-col"
                            animation={150}
                            fallbackOnBody
                            swapThreshold={0.65}
                            direction={"vertical"}
                            handle=".map-dragger"

                            list={teamsSortable}
                            setList={(list) => {
                                const changed = teamsSortable.some((value, index) => {
                                    const eq = list[index];
                                    return eq === undefined || eq.id !== value.id;
                                })
                                if (!changed)
                                    return;

                                setLocalTeams(
                                    list.map((e) => ({ ...e, id: e._id }))
                                );
                                setCanSave(true);
                            }}
                        >
                            {localTeams.map((localTeam, index) => (
                                <TeamCard
                                    key={localTeam._id}
                                    index={index}
                                    localTeam={localTeam}
                                    onUpdate={() => { }}
                                    onDelete={() => { }}
                                    participants={getParticipantsQuery?.data ?? []}
                                    overlappingParticipants={overlappingParticipants}
                                />
                            ))}
                        </ReactSortable>
                    </div>
                }
            </div>
        </div>
    )
}