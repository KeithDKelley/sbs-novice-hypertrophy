import db from '../client';

export interface WorkoutSession {
  id: number;
  date: string;
  week_number: number;
  day_number: number;
  logged_at: string;
}

const getTodaySessionStmt = db.prepare(`
  SELECT * FROM workout_sessions
  WHERE day_number = ? AND week_number = ?
  ORDER BY logged_at DESC
  LIMIT 1
`);

const getAllSessionsStmt = db.prepare(`
  SELECT * FROM workout_sessions ORDER BY logged_at DESC
`);

const insertSessionStmt = db.prepare(`
  INSERT INTO workout_sessions (date, week_number, day_number, logged_at)
  VALUES (@date, @week_number, @day_number, @logged_at)
`);

export function getTodaySession(dayNumber: number, weekNumber: number): WorkoutSession | undefined {
  return getTodaySessionStmt.get(dayNumber, weekNumber) as WorkoutSession | undefined;
}

export function getAllSessions(): WorkoutSession[] {
  return getAllSessionsStmt.all() as WorkoutSession[];
}

export function getWeekSessions(weekNumber: number): WorkoutSession[] {
  return db.prepare('SELECT * FROM workout_sessions WHERE week_number = ? ORDER BY day_number ASC').all(weekNumber) as WorkoutSession[];
}

export function insertSession(data: {
  date: string;
  week_number: number;
  day_number: number;
  logged_at: string;
}): number {
  const result = insertSessionStmt.run(data);
  return result.lastInsertRowid as number;
}
