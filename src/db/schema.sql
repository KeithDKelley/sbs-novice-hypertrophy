CREATE TABLE IF NOT EXISTS profile (
  id              INTEGER PRIMARY KEY DEFAULT 1,
  frequency       INTEGER NOT NULL,
  current_day     INTEGER NOT NULL DEFAULT 1,
  current_week    INTEGER NOT NULL DEFAULT 1,
  created_at      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS exercises (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,
  is_bodyweight   INTEGER NOT NULL DEFAULT 0,
  rounding        REAL NOT NULL DEFAULT 5,
  sort_order      INTEGER NOT NULL,
  starting_sets          INTEGER NOT NULL DEFAULT 3,
  ending_sets            INTEGER NOT NULL DEFAULT 5,
  starting_reps          INTEGER,
  ending_reps            INTEGER,
  set_increase           INTEGER NOT NULL DEFAULT 1,
  reps_per_set_increase  INTEGER NOT NULL DEFAULT 2,
  weight_increase        REAL,
  current_weight         REAL,
  current_sets           INTEGER NOT NULL DEFAULT 3,
  current_reps           INTEGER,
  current_reps_per_set   INTEGER
);

CREATE TABLE IF NOT EXISTS day_assignments (
  exercise_id  TEXT NOT NULL REFERENCES exercises(id),
  day_number   INTEGER NOT NULL,
  position     INTEGER NOT NULL,
  PRIMARY KEY (exercise_id, day_number)
);

CREATE TABLE IF NOT EXISTS workout_sessions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  date        TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  day_number  INTEGER NOT NULL,
  logged_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workout_entries (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id        INTEGER NOT NULL REFERENCES workout_sessions(id),
  exercise_id       TEXT NOT NULL REFERENCES exercises(id),
  prescribed_weight REAL,
  prescribed_sets   INTEGER NOT NULL,
  prescribed_reps   INTEGER,
  completed         INTEGER NOT NULL,
  notes             TEXT
);
