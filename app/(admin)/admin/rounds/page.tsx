"use client";

import { ReactSortable } from "react-sortablejs";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function () {
  const getRoundsQuery = useQuery({
    enabled: false,
    queryFn: () => {
      return { rounds: [] };
    },
  });

  const saveChangesMutation = useMutation({});

  const [localRounds, setLocalRounds] = useState([]);
  const [isDirty, setIsDirty] = useState(false);

  return (
    <div className="overflow-auto relative h-full min-w-fit">
      <h1 className="text-3xl text-white font-bold mb-4 flex flex-row justify-between items-center">
        <p>Rounds</p>
        <div className="flex flex-row gap-2 justify-end items-baseline">
          <button className={"btn btn-warning btn-xs w-fit btn-disabled"}>
            delete cache
          </button>
          <button className={"btn btn-neutral btn-xs w-fit btn-disabled"}>
            add round
          </button>
        </div>
      </h1>

      {getRoundsQuery.status === "loading" ? (
        <span className="loading loading-spinner"></span>
      ) : (
        <></>
      )}

      {getRoundsQuery.status !== "success" ? (
        <div>
          {getRoundsQuery.status === "error" ? (
            "error"
          ) : (
            <span className="loading loading-spinner"></span>
          )}
        </div>
      ) : getRoundsQuery.data.rounds.length <= 0 ? (
        <div>No one but us chickens!</div>
      ) : (
        <ReactSortable
          className="flex gap-2 flex-col pb-20"
          list={[]}
          setList={(list) => {}}
          animation={150}
          handle=".round-dragger"
        >
          {getRoundsQuery.data.rounds.map((round) => (
            <div>{round}</div>
          ))}
        </ReactSortable>
      )}
      <div className="absolute bottom-5 right-0">
        <button className={"btn btn-disabled"}>
          <span className="loading loading-spinner"></span>
        </button>
      </div>
    </div>
  );
}
