import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), 'data', 'exercise_planner.db');

// Ensure the data directory exists
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Apply schema on startup (idempotent)
const schemaPath = path.join(process.cwd(), 'src', 'db', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

export default db;
