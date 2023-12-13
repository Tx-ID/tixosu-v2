"use client";

import { ReactSortable } from "react-sortablejs";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  RoundBeatmap,
  roundBaseSchema,
  roundBeatmapSchema,
} from "@/lib/data/models";
import { DateTime } from "luxon";
import _ from "lodash";
import {
  BeatmapDifficultyAttributes,
  BeatmapWithDifficultyAttributes,
} from "@/lib/data/osu";

const beatmapWithRoundsResponseSchema = z.intersection(
  roundBaseSchema,
  z.object({ beatmaps: z.array(roundBeatmapSchema) })
);
type BeatmapWithRoundsResponse = z.infer<
  typeof beatmapWithRoundsResponseSchema
>;
type LocalBeatmap = z.mergeTypes<
  RoundBeatmap,
  {
    localId: number; // internal ID to identify on the UI
    zindex?: undefined;
  }
>;
type LocalBeatmapWithAttributes = z.mergeTypes<
  LocalBeatmap,
  BeatmapDifficultyAttributes
>;
type LocalRound = z.mergeTypes<
  BeatmapWithRoundsResponse,
  {
    localId: number; // internal ID to identify on the UI
    id?: number;
    date: DateTime;
    zindex?: undefined;
    beatmaps: LocalBeatmap[];
  }
>;

type BeatmapCardProps = {
  beatmap: LocalBeatmap;
  index?: number;
  onUpdate: (details: LocalBeatmap) => void;
  onDelete: () => void;
};
function BeatmapCard({ beatmap, index, onUpdate, onDelete }: BeatmapCardProps) {
  const colorMap: Record<string, { bg: string; border: string }> = {
    nm: {
      bg: "bg-nomod",
      border: "border-nomod",
    },
    hd: {
      bg: "bg-color-hidden",
      border: "border-color-hidden",
    },
    dt: {
      bg: "bg-doubletime",
      border: "border-doubletime",
    },
    fm: {
      bg: "bg-freemod",
      border: "border-freemod",
    },
    hr: {
      bg: "bg-hardrock",
      border: "border-hardrock",
    },
    tb: {
      bg: "bg-tiebreaker",
      border: "border-tiebreaker",
    },
  };
  const defaultColor = {
    bg: "bg-dark",
    border: "border-dark",
  };
  const getColorForMod = (mod: string) =>
    colorMap[mod.toLowerCase()] ?? defaultColor;

  function formatTime(seconds: number) {
    const date = new Date(seconds * 1000);
    const hoursPart = String(date.getHours()).padStart(2, "0");
    const minutesPart = String(date.getMinutes()).padStart(2, "0");
    const secondsPart = String(date.getSeconds()).padStart(2, "0");

    return `${minutesPart}:${secondsPart}`;
  }

  const modStyles = getColorForMod(beatmap.mod);

  return (
    <div
      key={beatmap.localId}
      className={
        "rounded-lg flex flex-col gap-4 bg-opacity-10 " +
        modStyles.bg +
        " " +
        modStyles.border +
        " "
      }
    >
      <div className="px-4 grid grid-cols-24 gap-2 align-middle items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="map-dragger w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 9h16.5m-16.5 6.75h16.5"
          />
        </svg>
        <div className="flex flex-col col-span-2">
          <label className="label-text text-xs">Mods</label>
          <input
            type="text"
            className="input input-bordered input-sm"
            value={beatmap.mod}
            onChange={(e) =>
              onUpdate({
                ...beatmap,
                mod: e.target.value,
              })
            }
          ></input>
        </div>
        <div className="flex flex-col col-span-2">
          <label className="label-text text-xs">Number</label>
          <input
            type="number"
            className="input input-bordered input-sm"
          ></input>
        </div>
        <div className="flex flex-col col-span-3">
          <label className="label-text text-xs">Beatmap Id</label>
          <input
            type="number"
            className="input input-bordered input-sm"
            value={beatmap.beatmapId}
            onChange={(e) =>
              onUpdate({ ...beatmap, beatmapId: parseInt(e.target.value) })
            }
          ></input>
        </div>
        <div className="flex flex-col col-span-15">
          <span className="h-16">
            <p className="opacity-0">invisible label</p>
          </span>
        </div>
        <div className="flex items-center">
          <button onClick={() => onDelete()} className="btn btn-neutral btn-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

type RoundCardProps = {
  round: LocalRound;
  index?: number;
  onUpdate: (details: LocalRound) => void;
  onDelete: () => void;
};
function RoundCard({ round, index, onUpdate, onDelete }: RoundCardProps) {
  const createBeatmap: () => LocalBeatmap = () => ({
    localId:
      round.beatmaps
        .map((e) => e.localId)
        .reduce((max, next) => (next > max ? next : max), 0) + 1,
    zindex: undefined,
    beatmapId: 0,
    mod: "NM",
    label: "NM1",
  });

  return (
    <div
      className={
        "bg-zinc-900 rounded-lg flex flex-col pt-4 gap-4 " +
        (round.beatmaps.length <= 0 ? "pb-4" : "pb-2")
      }
    >
      <div className="flex items-center gap-4 w-full px-4 justify-between">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6 text-zinc-700 round-dragger"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 9h16.5m-16.5 6.75h16.5"
          />
        </svg>
        <p className="font-bold">
          {index !== undefined ? `#${index + 1}` : ""}
        </p>
        <div className="flex flex-col">
          <label className="label-text text-xs">Name</label>
          <input
            type="text"
            className="input input-bordered input-sm"
            value={round.name}
            onChange={(e) =>
              onUpdate({
                ...round,
                name: e.target.value,
              })
            }
          ></input>
        </div>
        <div className="flex flex-col w-20">
          <label className="label-text text-xs">Best Of</label>
          <input
            type="number"
            className="input input-bordered input-sm w-full"
            value={round.bestOf}
            onChange={(e) =>
              onUpdate({ ...round, bestOf: _.toNumber(e.target.value) })
            }
          ></input>
        </div>
        <div className="flex flex-col mr-auto">
          <label className="label-text text-xs">Start Date</label>
          <input
            type="date"
            className="input input-bordered input-sm"
            value={round.date.toISODate()!}
            onChange={(e) =>
              onUpdate({ ...round, date: DateTime.fromISO(e.target.value) })
            }
          ></input>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onUpdate({
                ...round,
                beatmaps: [...round.beatmaps, createBeatmap()],
              })
            }
            className={"btn btn-neutral btn-sm"}
          >
            ADD BEATMAP
          </button>
          <button
            onClick={() => onDelete()}
            className={"btn btn-warning btn-sm"}
          >
            DELETE
          </button>
        </div>
      </div>

      {round.beatmaps.length <= 0 ? (
        ""
      ) : (
        <div className="bg-dark w-full p-4">
          <ReactSortable
            className="flex gap-1 flex-col"
            list={round.beatmaps.map((e) => ({ ...e, id: e.localId }))}
            setList={(list) => onUpdate({ ...round, beatmaps: list })}
            animation={150}
            fallbackOnBody
            swapThreshold={0.65}
            direction={"vertical"}
            handle=".map-dragger"
          >
            {round.beatmaps.map((beatmap, roundBeatmapIndex) => (
              <BeatmapCard
                key={beatmap.localId}
                beatmap={beatmap}
                onUpdate={(newBeatmap) =>
                  onUpdate({
                    ...round,
                    beatmaps: [
                      ...round.beatmaps.slice(0, roundBeatmapIndex),
                      newBeatmap,
                      ...round.beatmaps.slice(roundBeatmapIndex + 1),
                    ],
                  })
                }
                onDelete={() =>
                  onUpdate({
                    ...round,
                    beatmaps: [
                      ...round.beatmaps.slice(0, roundBeatmapIndex),
                      ...round.beatmaps.slice(roundBeatmapIndex + 1),
                    ],
                  })
                }
              />
            ))}
          </ReactSortable>
        </div>
      )}
    </div>
  );
}

export default function () {
  const getRoundsQuery = useQuery({
    queryKey: [], //required by Tanstack, but unused
    enabled: false,
    queryFn: async () => {
      const raw = await fetch("/api/rounds").then((res) => res.json());
      const parsed = z.array(beatmapWithRoundsResponseSchema).parse(raw);
      const transformed = parsed
        .sort((a, b) => a.zindex - b.zindex)
        .map((round) => ({
          ...round,
          localId: round.id,
          zindex: undefined,
          date: DateTime.fromISO(round.date),
          beatmaps: round.beatmaps
            .sort((a, b) => a.zindex - b.zindex)
            .map((beatmap, idx) => ({
              ...beatmap,
              localId: idx,
              zindex: undefined,
            })),
        }));

      setLocalRounds(transformed);
      return transformed;
    },
  });

  const saveChangesMutation = useMutation({});

  const [localRounds, setLocalRounds] = useState<LocalRound[]>([]);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const resetLocalState = () => {
    getRoundsQuery.refetch();
    setIsDirty(false);
  };

  const createRound: () => LocalRound = () => ({
    id: undefined,
    zindex: undefined,
    localId: (_.max(localRounds.map((e) => e.localId)) ?? 0) + 1,
    name: "New Round",
    date: DateTime.now(),
    bestOf: 3,
    visible: true,
    beatmaps: [],
  });

  useEffect(() => {
    resetLocalState();
  }, []);

  return (
    <div className="overflow-auto relative h-full min-w-fit">
      <h1 className="text-3xl text-white font-bold mb-4 flex flex-row justify-between items-center">
        <p>Rounds</p>
        <div className="flex flex-row gap-2 justify-end items-baseline">
          <button className={"btn btn-warning btn-xs w-fit btn-disabled"}>
            delete cache
          </button>
          <button
            className={
              "btn btn-neutral btn-xs w-fit " +
              (getRoundsQuery.status !== "success" ? "btn-disabled" : "")
            }
            disabled={getRoundsQuery.status !== "success"}
            onClick={() => {
              setLocalRounds([...localRounds, createRound()]);
            }}
          >
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
            JSON.stringify(getRoundsQuery.error)
          ) : (
            <span className="loading loading-spinner"></span>
          )}
        </div>
      ) : localRounds.length <= 0 ? (
        <div>No one but us chickens!</div>
      ) : (
        <ReactSortable
          className="flex gap-2 flex-col pb-20"
          list={localRounds.map((round) => ({
            ...round,
            id: round.name,
            _id: round.id,
          }))}
          setList={(list) => {
            setLocalRounds(list.map((e) => ({ ...e, id: e._id })));
          }}
          animation={150}
          handle=".round-dragger"
        >
          {localRounds.map((round, roundIndex) => (
            <RoundCard
              key={round.localId}
              round={round}
              index={roundIndex}
              onUpdate={(newData) =>
                setLocalRounds([
                  ...localRounds.slice(0, roundIndex),
                  newData,
                  ...localRounds.slice(roundIndex + 1),
                ])
              }
              onDelete={() =>
                setLocalRounds([
                  ...localRounds.slice(0, roundIndex),
                  ...localRounds.slice(roundIndex + 1),
                ])
              }
            />
          ))}
        </ReactSortable>
      )}
      <div className="absolute bottom-5 right-0">
        <button className={"btn btn-disabled"}>
          <span className="loading loading-spinner"></span>
        </button>
      </div>
      <div>{JSON.stringify(localRounds)}</div>
    </div>
  );
}
