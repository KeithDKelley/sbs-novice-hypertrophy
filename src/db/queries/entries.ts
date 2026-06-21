import db from '../client';

export interface WorkoutEntry {
  id: number;
  session_id: number;
  exercise_id: string;
  prescribed_weight: number | null;
  prescribed_sets: number;
  prescribed_reps: number | null;
  completed: number;
  notes: string | null;
}

const insertEntryStmt = db.prepare(`
  INSERT INTO workout_entries (
    session_id, exercise_id, prescribed_weight, prescribed_sets,
    prescribed_reps, completed, notes
  ) VALUES (
    @session_id, @exercise_id, @prescribed_weight, @prescribed_sets,
    @prescribed_reps, @completed, @notes
  )
`);

const getEntriesForSessionStmt = db.prepare(`
  SELECT we.*, e.name as exercise_name
  FROM workout_entries we
  INNER JOIN exercises e ON e.id = we.exercise_id
  WHERE we.session_id = ?
  ORDER BY we.id ASC
`);

export function insertEntry(data: {
  session_id: number;
  exercise_id: string;
  prescribed_weight: number | null;
  prescribed_sets: number;
  prescribed_reps: number | null;
  completed: number;
  notes: string | null;
}): void {
  insertEntryStmt.run(data);
}

export function getEntriesForSession(
  sessionId: number,
): (WorkoutEntry & { exercise_name: string })[] {
  return getEntriesForSessionStmt.all(sessionId) as (WorkoutEntry & { exercise_name: string })[];
}
