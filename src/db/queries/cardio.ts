import db from '../client';

export interface CardioLog {
  id: number;
  exercise_id: string;
  date: string;
  week_number: number;
  completed: number;
  prescribed_miles: number | null;
  prescribed_mph: number | null;
  time_seconds: number | null;
  logged_at: string;
}

const getLogsForWeekStmt = db.prepare(
  'SELECT * FROM cardio_log WHERE week_number = ? ORDER BY logged_at ASC',
);

const insertLogStmt = db.prepare(`
  INSERT INTO cardio_log (exercise_id, date, week_number, completed, prescribed_miles, prescribed_mph, time_seconds, logged_at)
  VALUES (@exercise_id, @date, @week_number, @completed, @prescribed_miles, @prescribed_mph, @time_seconds, @logged_at)
`);

export function getCardioLogsForWeek(weekNumber: number): CardioLog[] {
  return getLogsForWeekStmt.all(weekNumber) as CardioLog[];
}

export function insertCardioLog(data: {
  exercise_id: string;
  date: string;
  week_number: number;
  completed: number;
  prescribed_miles: number | null;
  prescribed_mph: number | null;
  time_seconds: number | null;
  logged_at: string;
}): void {
  insertLogStmt.run(data);
}
