import db from '../client';
import type { Exercise, RunExercise } from '../../lib/progression';

const getAllExercisesStmt = db.prepare(
  "SELECT * FROM exercises WHERE exercise_type = 'standard' OR exercise_type IS NULL ORDER BY sort_order ASC",
);

const getRunExercisesStmt = db.prepare(
  "SELECT * FROM exercises WHERE exercise_type IN ('run_distance', 'run_speed', 'run_outdoor') ORDER BY sort_order ASC",
);

const getExercisesForDayStmt = db.prepare(`
  SELECT e.* FROM exercises e
  INNER JOIN day_assignments da ON da.exercise_id = e.id
  WHERE da.day_number = ?
  ORDER BY da.position ASC
`);

const updateExerciseStateStmt = db.prepare(`
  UPDATE exercises SET
    current_weight = @current_weight,
    current_sets = @current_sets,
    current_reps = @current_reps,
    current_reps_per_set = @current_reps_per_set
  WHERE id = @id
`);

const upsertExerciseStmt = db.prepare(`
  INSERT INTO exercises (
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
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    category = excluded.category,
    is_bodyweight = excluded.is_bodyweight,
    rounding = excluded.rounding,
    sort_order = excluded.sort_order,
    starting_sets = excluded.starting_sets,
    ending_sets = excluded.ending_sets,
    starting_reps = excluded.starting_reps,
    ending_reps = excluded.ending_reps,
    set_increase = excluded.set_increase,
    reps_per_set_increase = excluded.reps_per_set_increase,
    weight_increase = excluded.weight_increase,
    current_weight = excluded.current_weight,
    current_sets = excluded.current_sets,
    current_reps = excluded.current_reps,
    current_reps_per_set = excluded.current_reps_per_set
`);

export function getAllExercises(): Exercise[] {
  return getAllExercisesStmt.all() as Exercise[];
}

export function getRunExercises(): RunExercise[] {
  return getRunExercisesStmt.all() as RunExercise[];
}

export function getExercisesForDay(dayNumber: number): Exercise[] {
  return getExercisesForDayStmt.all(dayNumber) as Exercise[];
}

export function updateExerciseState(
  id: string,
  state: {
    current_weight: number | null;
    current_sets: number;
    current_reps: number | null;
    current_reps_per_set: number | null;
  },
): void {
  updateExerciseStateStmt.run({ id, ...state });
}

export function upsertExercise(exercise: {
  id: string;
  name: string;
  category: string;
  is_bodyweight: number;
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
  current_sets: number;
  current_reps: number | null;
  current_reps_per_set: number | null;
}): void {
  upsertExerciseStmt.run(exercise);
}
