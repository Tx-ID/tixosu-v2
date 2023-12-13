import { Redis } from "@upstash/redis/nodejs";
import * as Osu from "@/lib/data/osu";
import * as Turso from "@/lib/data/turso";

/**
 *
 * @param {import("@libsql/client/.").Client} turso
 * @param {Redis} upstash
 */
export async function getRegisteredPlayers(turso, upstash) {
  const participants = await Turso.getAllParticipants(turso);

  const ids = participants.reduce((arr, e) => {
    arr.push(e.osuId);
    return arr;
  }, []);

  const players = await Osu.getPlayersById(turso, upstash, ...ids);

  const get = participants.map((e) => ({
    ...e,
    profile: Object.values(players).filter((p) => p.id == e.osuId)[0],
  })); // i love letting someone else do the naming scheme

  return get;
}

/**
 *
 * @param {import("@libsql/client/.").Client} turso
 * @param {number} osuId
 */
export async function registerNewPlayer(turso, osuId) {
  await Turso.addParticipantId(turso, osuId);
}

/**
 * @param {import("@libsql/client/.").Client} turso
 * @param {number} osuId
 */
export async function removePlayerFromRegistered(turso, osuId) {
  await Turso.removeParticipantId(turso, osuId);
}

/**
 * @param {import("@libsql/client/.").Client} turso
 * @param {number} osuId
 */
export async function hidePlayerFromRegistered(turso, osuId) {
  await Turso.setParticipantVisible(turso, osuId, false);
}

/**
 * @param {import("@libsql/client/.").Client} turso
 * @param {number} osuId
 */
export async function unhidePlayerFromRegistered(turso, osuId) {
  await Turso.setParticipantVisible(turso, osuId, true);
}
