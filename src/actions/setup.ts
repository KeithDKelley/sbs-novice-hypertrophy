'use server';

import { redirect } from 'next/navigation';
import { upsertProfile } from '../db/queries/profile';
import { upsertExercise } from '../db/queries/exercises';
import db from '../db/client';
import { SPLITS } from '../lib/defaults';

export interface ExerciseSetupData {
  id: string;
  name: string;
  category: string;
  is_bodyweight: boolean;
  rounding: number;
  sort_order: number;
  starting_sets: number;
  ending_sets: number;
  starting_reps: number | null;
  ending_reps: number | null;
  set_increase: number;
  reps_per_set_increase: number;
  weight_increase: number | null;
  current_weight: number | null;
  current_reps_per_set: number | null;
}

export async function initProfile(data: {
  frequency: number;
  exercises: ExerciseSetupData[];
}): Promise<void> {
  const { frequency, exercises } = data;

  upsertProfile({
    frequency,
    current_day: 1,
    current_week: 1,
    created_at: new Date().toISOString(),
  });

  for (const ex of exercises) {
    upsertExercise({
      id: ex.id,
      name: ex.name,
      category: ex.category,
      is_bodyweight: ex.is_bodyweight ? 1 : 0,
      rounding: ex.rounding,
      sort_order: ex.sort_order,
      starting_sets: ex.starting_sets,
      ending_sets: ex.ending_sets,
      starting_reps: ex.starting_reps,
      ending_reps: ex.ending_reps,
      set_increase: ex.set_increase,
      reps_per_set_increase: ex.reps_per_set_increase,
      weight_increase: ex.weight_increase,
      current_weight: ex.current_weight,
      current_sets: ex.starting_sets,
      current_reps: ex.starting_reps,
      current_reps_per_set: ex.current_reps_per_set,
    });
  }

  // Seed day assignments
  const split = SPLITS[frequency];
  if (!split) throw new Error(`Unknown frequency: ${frequency}`);

  db.prepare('DELETE FROM day_assignments').run();

  const stmt = db.prepare(`
    INSERT INTO day_assignments (exercise_id, day_number, position)
    VALUES (@exercise_id, @day_number, @position)
  `);

  const insertAll = db.transaction(() => {
    for (const [dayStr, exerciseIds] of Object.entries(split)) {
      const dayNumber = parseInt(dayStr, 10);
      (exerciseIds as string[]).forEach((exerciseId, position) => {
        // Only insert if the exercise exists
        const exists = db
          .prepare('SELECT id FROM exercises WHERE id = ?')
          .get(exerciseId);
        if (exists) {
          stmt.run({ exercise_id: exerciseId, day_number: dayNumber, position });
        }
      });
    }
  });

  insertAll();

  redirect('/today');
}
