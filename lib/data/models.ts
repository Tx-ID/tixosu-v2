import { z } from "zod";
import * as zodExt from "@/lib/util/zodExt";

/**
 * Backend types that frontend can sometimes use to parse API data.
 * @module models
 * */

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
  expiresOn: zodExt.intoLuxonDateTime(),
});

export type AccessToken = z.infer<typeof accessTokenBaseSchema>;

export const timelineEventBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  start: zodExt.intoLuxonDateTime(),
  end: zodExt.intoLuxonDateTime(),
});

export type TimelineEvent = z.infer<typeof timelineEventBaseSchema>;

export const roundBaseSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  zindex: z.number().int(),
  date: zodExt.intoLuxonDateTime(),
  bestOf: z.number().int(),
  visible: z.coerce.boolean(),
});

export const roundBeatmapSchema = z.object({
  zindex: z.number().int(),
  beatmapId: z.number().int(),
  mod: z.string(),
  label: z.string(),
});

export const roundWithBeatmapsSchema = roundBaseSchema.merge(
  z.object({ beatmaps: z.array(roundBeatmapSchema) })
);

export type Round = z.infer<typeof roundBaseSchema>;

export type RoundBeatmap = z.infer<typeof roundBeatmapSchema>;

export type RoundWithBeatmaps = z.infer<typeof roundWithBeatmapsSchema>;

export const beatmapSchema = z.object({
  id: z.coerce.number(),

  creatorId: z.coerce.number(),
  creator: z.string(),

  title: z.string(),
  titleUnicode: z.string(),
  artist: z.string(),
  artistUnicode: z.string(),
  difficulty: z.string(),

  url: z.string().url(),
  covers: z.object({
    cover: z.string().url(),
    "cover@2x": z.string().url(),
    card: z.string().url(),
    "card@2x": z.string().url(),
    list: z.string().url(),
    "list@2x": z.string().url(),
    slimcover: z.string().url(),
    "slimcover@2x": z.string().url(),
  }),

  cs: z.coerce.number(),
  ar: z.coerce.number(),
  accuracy: z.coerce.number(),
  drain: z.coerce.number(),
  hitLength: z.coerce.number(),
  totalLength: z.coerce.number(),
});

export const beatmapDifficultyAttributeSetSchema = z.object({
  modsBitSet: z.number(),
  mods: z.string(),
  attributes: z.object({
    maxCombo: z.coerce.number(),
    starRating: z.coerce.number(),
    aimDifficulty: z.coerce.number(),
    approachRate: z.coerce.number(),
    flashlightDifficulty: z.coerce.number(),
    overallDifficulty: z.coerce.number(),
    sliderFactor: z.coerce.number(),
    speedDifficulty: z.coerce.number(),

    cs: z.coerce.number(),
    od: z.coerce.number(),
    ar: z.coerce.number(),
    hp: z.coerce.number(),
    totalLength: z.coerce.number(),
    hitLength: z.coerce.number(),
  }),
});

export const beatmapWithDifficultyAttributeSetSchema = beatmapSchema.merge(
  beatmapDifficultyAttributeSetSchema
);

export type Beatmap = z.infer<typeof beatmapSchema>;

export type BeatmapDifficultyAttributeSet = z.infer<
  typeof beatmapDifficultyAttributeSetSchema
>;

export type BeatmapWithDifficultyAttributeSet = z.infer<
  typeof beatmapDifficultyAttributeSetSchema
>;
