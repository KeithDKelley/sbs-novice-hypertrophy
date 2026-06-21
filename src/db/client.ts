import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), 'data', 'exercise_planner.db');

const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Apply schema (idempotent — uses IF NOT EXISTS throughout)
const schemaPath = path.join(process.cwd(), 'src', 'db', 'schema.sql');
db.exec(fs.readFileSync(schemaPath, 'utf8'));

// Migrations: add columns that didn't exist in the original schema.
// SQLite doesn't support IF NOT EXISTS on ALTER TABLE, so we catch errors.
const migrations = [
  "ALTER TABLE exercises ADD COLUMN exercise_type TEXT NOT NULL DEFAULT 'standard'",
  'ALTER TABLE exercises ADD COLUMN current_miles REAL',
  'ALTER TABLE exercises ADD COLUMN current_mph REAL',
  'ALTER TABLE exercises ADD COLUMN consecutive_failures INTEGER NOT NULL DEFAULT 0',
];
for (const sql of migrations) {
  try {
    db.exec(sql);
  } catch {
    // Column already exists — safe to ignore.
  }
}

// Bootstrap the 3 run exercises on every startup (INSERT OR IGNORE = idempotent).
db.prepare(`
  INSERT OR IGNORE INTO exercises (
    id, name, category, is_bodyweight, rounding, sort_order,
    exercise_type, current_miles, current_mph, consecutive_failures,
    starting_sets, ending_sets, set_increase, reps_per_set_increase
  ) VALUES (?, ?, 'Cardio', 0, 0, ?, ?, ?, ?, 0, 1, 1, 0, 0)
`).run('run_long_distance', 'Long-distance run', 100, 'run_distance', 3.0, 8.0);

db.prepare(`
  INSERT OR IGNORE INTO exercises (
    id, name, category, is_bodyweight, rounding, sort_order,
    exercise_type, current_miles, current_mph, consecutive_failures,
    starting_sets, ending_sets, set_increase, reps_per_set_increase
  ) VALUES (?, ?, 'Cardio', 0, 0, ?, ?, ?, ?, 0, 1, 1, 0, 0)
`).run('run_speed', 'Speed run', 101, 'run_speed', 3.0, 8.0);

db.prepare(`
  INSERT OR IGNORE INTO exercises (
    id, name, category, is_bodyweight, rounding, sort_order,
    exercise_type, current_miles, current_mph, consecutive_failures,
    starting_sets, ending_sets, set_increase, reps_per_set_increase
  ) VALUES (?, ?, 'Cardio', 0, 0, ?, ?, ?, ?, 0, 1, 1, 0, 0)
`).run('run_outdoor', 'Outdoor run (IRL)', 102, 'run_outdoor', 6.25, null);

export default db;
