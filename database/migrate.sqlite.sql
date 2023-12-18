CREATE TABLE `access_token` (
    `token` TEXT PRIMARY KEY,
    `expires_on` TEXT NOT NULL
);

CREATE TABLE `environment` (
    `name` TEXT PRIMARY KEY,
    `active` BOOLEAN NOT NULL
);

CREATE TABLE `timeline_event` (
    `id` TEXT PRIMARY KEY,
    `name` TEXT NOT NULL,
    `start_time` TEXT NOT NULL,
    `end_time` TEXT NOT NULL,
    CHECK (`start_time` < `end_time`)
);

CREATE INDEX `by_start` ON `timeline_event`(`start_time`);


CREATE TABLE `admin` (
    `osu_id` INTEGER PRIMARY KEY
);

CREATE TABLE `participant` (
    `osu_id` INTEGER PRIMARY KEY,
    `team_id` INTEGER DEFAULT NULL,
    `visible` BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE `team` (
    `id` INTEGER PRIMARY KEY,
    `name` TEXT NOT NULL,
    `index` INTEGER NOT NULL,
    `icon_url` TEXT DEFAULT NULL,
    `visible` BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE `round` (
    `id` INTEGER PRIMARY KEY,
    `zindex` INTEGER NOT NULL,
    `name` TEXT NOT NULL,
    `date` TEXT NOT NULL,
    `best_of` INTEGER NOT NULL,
    `visible` BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE `match` (
    `id` INTEGER PRIMARY KEY,
    `round_id` INTEGER NOT NULL,
    `red_team_id` INTEGER NOT NULL,
    `blue_team_id` INTEGER NOT NULL,
    `date` TEXT NOT NULL,
    `referee` TEXT NOT NULL,
    -- Added after row creation
    `roll_winner` TEXT DEFAULT NULL, -- ENUM(RED, BLUE)
    `first_pick` TEXT DEFAULT NULL, -- ENUM(RED, BLUE)
    `first_ban` TEXT DEFAULT NULL, -- ENUM(RED, BLUE)
    `red_points` INTEGER DEFAULT NULL,
    `blue_points` INTEGER DEFAULT NULL,
    `streamer` TEXT DEFAULT NULL,
    `mp_link` TEXT DEFAULT NULL
);

CREATE TABLE `match_commentator` (
    `id` INTEGER PRIMARY KEY,
    `match_id` INTEGER NOT NULL,
    `name` TEXT NOT NULL
);

CREATE TABLE `match_pick` (
    `number` INTEGER NOT NULL,
    `match_id` INTEGER,
    `mod` TEXT NOT NULL,
    `team` TEXT NOT NULL DEFAULT 'RED', -- ENUM(RED, BLUE),
    PRIMARY KEY (`number`, `match_id`)
);

CREATE TABLE `match_ban` (
    `number` INTEGER NOT NULL,
    `match_id` INTEGER,
    `mod` TEXT NOT NULL,
    `team` TEXT NOT NULL DEFAULT 'BLUE', -- ENUM(RED, BLUE),
    PRIMARY KEY (`number`, `match_id`)
);

CREATE TABLE `round_beatmap` (
    `round_id` INTEGER NOT NULL,
    `zindex` INTEGER NOT NULL,
    `beatmap_id` INTEGER NOT NULL,
    `mod` TEXT NOT NULL,
    `label` TEXT NOT NULL,
    PRIMARY KEY (`round_id`, `zindex`)
);

-- CACHE PROFILE_0
-- CACHE BEATMAP_0_MOD