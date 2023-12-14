import { DateTime } from "luxon";
import * as Turso from "@/lib/data/turso";
import { z } from "zod";
import _ from "lodash";
import { roundWithBeatmapsSchema } from "@/lib/data/models";

export const roundsOverwriteDataSchema = z.array(
  roundWithBeatmapsSchema.merge(z.object({ id: z.number().or(z.undefined()) }))
);

/** @typedef {z.infer<typeof roundsOverwriteDataSchema>} RoundsOverwriteRequest */

/**
 * @param {import("@libsql/client/.").Client} turso
 * @param {RoundsOverwriteRequest} data
 * @returns {Promise<void>}
 */
export async function overwriteRounds(turso, data) {
  const existingRoundIds = await Turso.getRoundIds(turso);
  const roundsToEdit = data
    .map((round) => round.id)
    .reduce((set, next) => {
      if (next !== undefined) {
        set.add(next);
      }
      return set;
    }, new Set());
  const roundIdsToDelete = existingRoundIds.filter(
    (id) => !roundsToEdit.has(id)
  );
  await Turso.deleteRounds(turso, roundIdsToDelete);

  for (const round of data) {
    if (round.id !== undefined) {
      await Turso.updateRound(turso, round.id, round);
      await Turso.setRoundBeatmaps(turso, round.id, round.beatmaps);
      continue;
    }
    const createdRound = await Turso.createRound(turso, round);
    await Turso.setRoundBeatmaps(turso, createdRound.id, round.beatmaps);
  }
}

/**
 *
 * @param {import("@libsql/client/.").Client} turso
 * @param {number} roundId
 * @returns {Promise<boolean>}
 */
async function checkRoundData(turso, roundId) {
  return await Turso.verifyRoundExists(turso, roundId);
}

/**
 * @param {import("@libsql/client/.").Client} turso
 * @returns {Promise<import("@/lib/data/models").RoundWithBeatmaps[]>}
 */
export async function getRounds(turso) {
  return await Turso.getRounds(turso);
}

/**
 * @param {import("@libsql/client/.").Client} turso
 * @returns {Promise<import("@/lib/data/models").RoundWithBeatmaps[]>}
 */
export async function getVisibleRounds(turso) {
  return (await Turso.getRounds(turso)).filter((round) => round.visible);
}

/**
 *
 * @param {import("@libsql/client/.").Client} turso
 * @returns {Promise<import("@/lib/data/models").Round>}
 */
export async function addRound(turso) {
  return await Turso.createRound(turso, {
    name: "New Round",
    date: DateTime.now(),
    bestOf: 3,
    visible: false,
  });
}

/**
 * @param {import("@libsql/client/.").Client} turso
 * @param {number} roundId
 * @param {boolean} visible
 * @returns {Promise<import("@/lib/data/models").Round | null>}
 */
export async function setRoundVisible(turso, roundId, visible) {
  await Turso.setRoundVisible(turso, roundId, visible);
  return await Turso.getRound(turso, roundId);
}
