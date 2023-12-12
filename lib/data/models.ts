import { DateTime } from "luxon";
import { z } from "zod";

export const participantBaseSchema = z.object({
  osuId: z.number().int(),
  teamId: z.number().int().nullable(),
  visible: z.coerce.boolean(),
});

export type Participant = z.infer<typeof participantBaseSchema>;

export const teamBaseSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  iconUrl: z.string().nullable(),
});

export type Team = z.infer<typeof teamBaseSchema>;

export const accessTokenBaseSchema = z.object({
  token: z.string(),
  expiresOn: z.string().min(1),
});

export type AccessToken = z.infer<typeof accessTokenBaseSchema>;

export const timelineEventBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  start: z.string(),
  end: z.string(),
});

export type TimelineEvent = z.mergeTypes<
  z.infer<typeof timelineEventBaseSchema>,
  { start: DateTime; end: DateTime }
>;

export const roundBaseSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  zindex: z.number().int(),
  date: z.string().datetime(),
  bestOf: z.number().int(),
  visible: z.coerce.boolean(),
});

export const roundBeatmapSchema = z.object({
  zindex: z.number().int(),
  beatmapId: z.number().int(),
  mod: z.string(),
  label: z.string(),
});

export type Round = z.mergeTypes<
  z.infer<typeof roundBaseSchema>,
  { date: DateTime }
>;

export type RoundBeatmap = z.infer<typeof roundBeatmapSchema>;

export type RoundWithBeatmaps = Round & {
  beatmaps: RoundBeatmap[];
};
