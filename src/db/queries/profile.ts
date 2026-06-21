import db from '../client';

export interface Profile {
  id: number;
  frequency: number;
  current_day: number;
  current_week: number;
  created_at: string;
}

const getProfileStmt = db.prepare('SELECT * FROM profile WHERE id = 1');

const upsertProfileStmt = db.prepare(`
  INSERT INTO profile (id, frequency, current_day, current_week, created_at)
  VALUES (1, @frequency, @current_day, @current_week, @created_at)
  ON CONFLICT(id) DO UPDATE SET
    frequency = excluded.frequency,
    current_day = excluded.current_day,
    current_week = excluded.current_week
`);

const advanceDayStmt = db.prepare(`
  UPDATE profile SET
    current_week = CASE WHEN current_day >= @frequency THEN current_week + 1 ELSE current_week END,
    current_day = CASE WHEN current_day >= @frequency THEN 1 ELSE current_day + 1 END
  WHERE id = 1
`);

export function getProfile(): Profile | undefined {
  return getProfileStmt.get() as Profile | undefined;
}

export function upsertProfile(data: {
  frequency: number;
  current_day: number;
  current_week: number;
  created_at: string;
}): void {
  upsertProfileStmt.run(data);
}

export function advanceDay(frequency: number): void {
  advanceDayStmt.run({ frequency });
}
