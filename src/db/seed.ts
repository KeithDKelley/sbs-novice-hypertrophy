import db from './client';
import { DEFAULT_EXERCISES, SPLITS } from '../lib/defaults';

export interface SeedExercise {
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
  current_weight?: number | null;
  current_sets?: number;
  current_reps?: number | null;
  current_reps_per_set?: number | null;
}

export function seedExercises(exercises: SeedExercise[]): void {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO exercises (
      id, name, category, is_bodyweight, rounding, sort_order,
      starting_sets, ending_sets, starting_reps, ending_reps,
      set_increase, reps_per_set_increase, weight_increase,
      current_weight, current_sets, current_reps, current_reps_per_set
    ) VALUES (
      @id, @name, @category, @is_bodyweight, @rounding, @sort_order,
      @starting_sets, @ending_sets, @starting_reps, @ending_reps,
      @set_increase, @reps_per_set_increase, @weight_increase,
      @current_weight, @current_sets, @current_reps, @current_reps_per_set
    )
  `);

  const insertMany = db.transaction((exs: SeedExercise[]) => {
    for (const ex of exs) {
      stmt.run({
        id: ex.id,
        name: ex.name,
        category: ex.category,
        is_bodyweight: ex.is_bodyweight ? 1 : 0,
        rounding: ex.rounding,
        sort_order: ex.sort_order,
        starting_sets: ex.starting_sets,
        ending_sets: ex.ending_sets,
        starting_reps: ex.starting_reps ?? null,
        ending_reps: ex.ending_reps ?? null,
        set_increase: ex.set_increase,
        reps_per_set_increase: ex.reps_per_set_increase,
        weight_increase: ex.weight_increase ?? null,
        current_weight: ex.current_weight ?? null,
        current_sets: ex.current_sets ?? ex.starting_sets,
        current_reps: ex.current_reps ?? ex.starting_reps ?? null,
        current_reps_per_set: ex.current_reps_per_set ?? null,
      });
    }
  });

  insertMany(exercises);
}

export function seedDayAssignments(frequency: number): void {
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
      exerciseIds.forEach((exerciseId, position) => {
        stmt.run({ exercise_id: exerciseId, day_number: dayNumber, position });
      });
    }
  });

  insertAll();
}

export function getDefaultExercises() {
  return DEFAULT_EXERCISES;
}
