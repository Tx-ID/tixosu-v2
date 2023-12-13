import { createClient, Client } from "@libsql/client";
import { DateTime } from "luxon";
import _ from "lodash";
import { number, z } from "zod";
import {
  Participant,
  participantBaseSchema,
  AccessToken,
  accessTokenBaseSchema,
  roundBaseSchema,
  Round,
  RoundWithBeatmaps,
  RoundBeatmap,
  TimelineEvent,
  timelineEventBaseSchema,
} from "./models";

const config = {
  url: process.env.DB_URL,
  authToken: process.env.DB_TOKEN,
};

export function create(): Client {
  const { url, authToken } = config;
  if (!url || !authToken) {
    throw new Error("turso.js: Missing DB_URL or DB_TOKEN in environment!");
  }
  return createClient({
    url,
    authToken,
  });
}

export async function getParticipantIds(turso: Client): Promise<number[]> {
  const result = await turso.execute("SELECT osu_id AS osuId FROM participant");
  return z.array(z.number()).parse(result.rows.map((e) => e.osuId));
}

export async function getAllParticipants(
  turso: Client
): Promise<Participant[]> {
  const result = await turso.execute(
    "SELECT osu_id AS osuId, team_id AS teamId, visible FROM participant"
  );
  return z.array(participantBaseSchema).parse(result.rows);
}

export async function getVisibleParticipants(turso: Client) {
  const result = await turso.execute(
    "SELECT osu_id AS osuId, team_id AS teamId, visible FROM participant WHERE visible = true"
  );
  return z.array(participantBaseSchema).parse(result.rows);
}

export async function addParticipantId(
  turso: Client,
  id: number
): Promise<void> {
  await turso.execute({
    sql: "INSERT INTO `participant`(osu_id, visible) VALUES (?, ?)",
    args: [id, true],
  });
}

export async function setParticipantVisible(
  turso: Client,
  id: number,
  visible: boolean
) {
  await turso.execute({
    sql: "UPDATE `participant` SET visible = ? WHERE osu_id = ?",
    args: [visible, id],
  });
}

export async function removeParticipantId(turso: Client, id: number) {
  await turso.execute({
    sql: "DELETE FROM `participant` WHERE osu_id = ?",
    args: [id],
  });
}

export async function createTeam(turso: Client, name: string): Promise<bigint> {
  const result = await turso.execute({
    sql: "INSERT INTO `team`(name) VALUES (?)",
    args: [name],
  });
  return result.lastInsertRowid!!;
}

export async function removeTeam(turso: Client, teamId: number): Promise<void> {
  await turso.execute({
    sql: "DELETE FROM `team` WHERE id = ?",
    args: [teamId],
  });
}

export async function setParticipantToTeam(
  turso: Client,
  osuId: number,
  teamId: number
) {
  await turso.execute({
    sql: "UPDATE `participant` SET team_id = ? WHERE osu_id = ?",
    args: [teamId, osuId],
  });
}

export async function removeParticipantFromTeam(turso: Client, osuId: number) {
  await turso.execute({
    sql: "UPDATE `participant` SET team_id = NULL WHERE osu_id = ?",
    args: [osuId],
  });
}

export async function getStoredToken(
  turso: Client
): Promise<AccessToken | null> {
  const result = await turso.execute(
    "SELECT token, expires_on AS expiresOn FROM `access_token`"
  );

  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }

  return accessTokenBaseSchema.parse(row);
}

export async function storeToken(
  turso: Client,
  tokenResult: { token: string; expiresOn: DateTime }
): Promise<void> {
  await turso.batch(
    [
      "DELETE FROM `access_token`",
      {
        sql: "INSERT INTO `access_token`(token, expires_on) VALUES (?, ?)",
        args: [tokenResult.token, tokenResult.expiresOn.toISO()],
      },
    ],
    "write"
  );
}

export async function userIsParticipant(
  turso: Client,
  osuId: number
): Promise<boolean> {
  const result = await turso.execute({
    sql: "SELECT COUNT(*) AS found FROM `participant` WHERE osu_id = ?",
    args: [osuId],
  });
  return result?.rows[0]?.found === 1;
}

export async function userIsAdmin(
  turso: Client,
  osuId: number
): Promise<boolean> {
  const result = await turso.execute({
    sql: "SELECT COUNT(*) AS isadmin FROM `admin` WHERE `osu_id` = ?",
    args: [osuId],
  });
  return result?.rows[0]?.isadmin === 1;
}

export async function getTimelineEvent(
  turso: Client,
  id: string
): Promise<TimelineEvent | null> {
  const result = await turso.execute({
    sql: "SELECT id, name, start_time AS start, end_time AS end FROM `timeline_event` WHERE id = ?",
    args: [id],
  });
  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }
  return timelineEventBaseSchema.parse(row);
}

export async function getTimelineEvents(
  turso: Client
): Promise<TimelineEvent[]> {
  const result = await turso.execute(
    "SELECT id, name, start_time AS start, end_time AS end FROM `timeline_event` ORDER BY start_time"
  );
  return z.array(timelineEventBaseSchema).parse(result.rows);
}

export async function overrideTimelineEvent(
  turso: Client,
  id: string,
  value: { name: string; start: DateTime; end: DateTime }
): Promise<void> {
  await turso.execute({
    sql: "INSERT INTO `timeline_event`(id, name, start_time, end_time) VALUES (:id, :name, :start_time, :end_time) ON CONFLICT (id) DO UPDATE SET name = :name, start_time = :start_time, end_time = :end_time WHERE id = :id",
    args: {
      id: id,
      name: value.name,
      start_time: value.start.toISO(),
      end_time: value.end.toISO(),
    },
  });
}

export async function removeTimelineEvent(
  turso: Client,
  id: string
): Promise<void> {
  await turso.execute({
    sql: "DELETE FROM `timeline_event` WHERE id = ?",
    args: [id],
  });
}

const roundBeatmapJoinSchema = roundBaseSchema.merge(
  z.object({
    beatmap_roundId: z.number().int(),
    beatmap_zindex: z.number().int(),
    beatmap_beatmapId: z.number().int(),
    beatmap_mod: z.string(),
    beatmap_label: z.string(),
  })
);

export async function verifyRoundExists(
  turso: Client,
  roundId: number
): Promise<boolean> {
  const result = await turso.execute({
    sql: "SELECT COUNT(*) AS found FROM `round` WHERE round_id = ?",
    args: [roundId],
  });
  return result.rows[0]?.found === 1;
}

export async function getRounds(turso: Client): Promise<RoundWithBeatmaps[]> {
  const result = await turso.execute(
    `
        SELECT 
          round.id AS id, 
          round.zindex AS zindex, 
          round.name AS name, 
          round.date AS date, 
          round.best_of AS bestOf, 
          round.visible AS visible,
          round_beatmap.round_id AS beatmap_roundId, 
          round_beatmap.zindex AS beatmap_zindex, 
          round_beatmap.beatmap_id AS beatmap_beatmapId, 
          round_beatmap.mod AS beatmap_mod, 
          round_beatmap.label AS beatmap_label
        FROM \`round\` 
        LEFT JOIN \`round_beatmap\` 
        ON round.id = round_beatmap.round_id`
  );
  const parsedResults = z.array(roundBeatmapJoinSchema).parse(result.rows);
  return Object.values(_.groupBy(parsedResults, (row) => row.id)).map(
    (roundRows) => ({
      id: roundRows[0]!!.id,
      zindex: roundRows[0]!!.zindex,
      name: roundRows[0]!!.name,
      date: roundRows[0]!!.date,
      bestOf: roundRows[0]!!.bestOf,
      visible: roundRows[0]!!.visible,
      beatmaps:
        roundRows[0]!!.beatmap_roundId === null
          ? []
          : roundRows.map((row) => ({
              zindex: row.beatmap_zindex,
              beatmapId: row.beatmap_beatmapId,
              mod: row.beatmap_mod,
              label: row.beatmap_label,
            })),
    })
  );
}

export async function getRound(
  turso: Client,
  roundId: number
): Promise<RoundWithBeatmaps | null> {
  const result = await turso.execute({
    sql: `
    SELECT 
      round.id AS id, 
      round.zindex AS zindex, 
      round.name AS name, 
      round.date AS date, 
      round.best_of AS bestOf, 
      round.visible AS visible,
      round_beatmap.round_id AS beatmap_roundId, 
      round_beatmap.zindex AS beatmap_zindex, 
      round_beatmap.beatmap_id AS beatmap_beatmapId, 
      round_beatmap.mod AS beatmap_mod, 
      round_beatmap.label AS beatmap_label
    FROM \`round\` 
    LEFT JOIN \`round_beatmap\` 
    ON round.id = round_beatmap.round_id
    WHERE round.id = ?`,
    args: [roundId],
  });
  const parsedResults = z.array(roundBeatmapJoinSchema).parse(result.rows);
  const first = parsedResults[0];
  if (first === undefined) {
    return null;
  }
  return {
    id: first.id,
    zindex: first.zindex,
    name: first.name,
    date: first.date,
    bestOf: first.bestOf,
    visible: first.visible,
    beatmaps:
      first.beatmap_roundId === null
        ? []
        : parsedResults.map((row) => ({
            zindex: row.beatmap_zindex,
            beatmapId: row.beatmap_beatmapId,
            mod: row.beatmap_mod,
            label: row.beatmap_label,
          })),
  };
}

export async function createRound(
  turso: Client,
  {
    name,
    date,
    bestOf,
    visible,
  }: {
    name: string;
    date: DateTime;
    bestOf: number;
    visible: boolean;
  }
): Promise<Round> {
  const t = await turso.transaction("write");
  try {
    const lastZindex = z
      .number()
      .int()
      .parse(
        (
          await turso.execute(
            `SELECT zindex FROM round ORDER BY zindex DESC LIMIT 1`
          )
        ).rows[0]?.id ?? 0
      );
    const insertResult = await turso.execute({
      sql: `
                INSERT INTO \`round\` (zindex, name, date, best_of, visible) 
                VALUES (:zindex, :name, :date, :best_of, :visible)`,
      args: {
        zindex: lastZindex + 1,
        name,
        date: date.toISO(),
        best_of: bestOf,
        visible,
      },
    });
    const insertedId = insertResult.lastInsertRowid!!;
    const fetchRoundResult = await turso.execute({
      sql: "SELECT id, zindex, name, date, bestOf, visible FROM round WHERE id = ?",
      args: [insertedId],
    });
    const insertedRound = fetchRoundResult.rows[0];
    if (insertedRound === undefined) {
      throw new Error("Something went wrong creating the round");
    }
    return roundBaseSchema.parse(insertedRound);
  } catch (error) {
    await t.rollback();
    throw error;
  } finally {
    t.close();
  }
}

export async function setRoundVisible(
  turso: Client,
  roundId: number,
  visible: boolean
): Promise<void> {
  await turso.execute({
    sql: "UPDATE round SET visible = ? WHERE id = ?",
    args: [visible, roundId],
  });
}

export async function updateRound(
  turso: Client,
  id: number,
  {
    name,
    zindex,
    date,
    bestOf,
    visible,
  }: {
    name: string;
    zindex: number;
    date: DateTime;
    bestOf: number;
    visible: boolean;
  }
): Promise<void> {
  await turso.execute({
    sql: `
            UPDATE \`round\` 
            SET visible = :visible, name = :name, date = :date, best_of = :bestOf, zindex = :zindex 
            WHERE id = :id`,
    args: {
      visible,
      name,
      date: date.toISO(),
      bestOf,
      zindex,
      id,
    },
  });
}

export async function setRoundBeatmaps(
  turso: Client,
  id: number,
  beatmaps: RoundBeatmap[]
): Promise<void> {
  await turso.batch([
    {
      sql: "DELETE FROM `round_beatmap` WHERE round_id = ?",
      args: [id],
    },
    ...beatmaps.map((beatmap) => ({
      sql: `
        INSERT INTO \`round_beatmap\`(round_id, zindex, beatmap_id, mod, label)
        VALUES (:roundId, :zindex, :beatmapId, :mod, :label)`,
      args: {
        roundId: id,
        zindex: beatmap.zindex,
        beatmapId: beatmap.beatmapId,
        mod: beatmap.mod,
        label: beatmap.label,
      },
    })),
  ]);
}

export async function getRoundIds(
  turso: Client,
  { except }: { except?: number[] } = {}
): Promise<number[]> {
  const result = await turso.execute({
    sql: `
      SELECT id
      FROM round
      WHERE id NOT IN (?)`,
    args: [(except ?? []).join(", ")],
  });
  return z
    .array(z.object({ id: z.number() }))
    .parse(result.rows)
    .map((row) => row.id);
}

/**
 * Deletes rounds along with all their beatmaps, based on the provided IDs.
 */
export async function deleteRounds(
  turso: Client,
  ids: number[]
): Promise<void> {
  await turso.batch(
    ids.flatMap((id) => [
      {
        sql: `
          DELETE FROM round_beatmap
          WHERE round_id = ?`,
        args: [id],
      },
      {
        sql: `
          DELETE FROM round
          WHERE id = ?`,
        args: [id],
      },
    ])
  );
}
