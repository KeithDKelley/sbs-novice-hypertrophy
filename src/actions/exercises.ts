'use server';

import { revalidatePath } from 'next/cache';
import { upsertExercise } from '../db/queries/exercises';

export async function updateExercise(data: {
  id: string;
  name: string;
  category: string;
  is_bodyweight: boolean;
  rounding: number;
  starting_sets: number;
  ending_sets: number;
  starting_reps: number | null;
  ending_reps: number | null;
  set_increase: number;
  reps_per_set_increase: number;
  weight_increase: number | null;
}): Promise<void> {
  upsertExercise({
    id: data.id,
    name: data.name,
    category: data.category,
    is_bodyweight: data.is_bodyweight ? 1 : 0,
    rounding: data.rounding,
    sort_order: 0,
    starting_sets: data.starting_sets,
    ending_sets: data.ending_sets,
    starting_reps: data.starting_reps,
    ending_reps: data.ending_reps,
    set_increase: data.set_increase,
    reps_per_set_increase: data.reps_per_set_increase,
    weight_increase: data.weight_increase,
    current_weight: null,
    current_sets: data.starting_sets,
    current_reps: data.starting_reps,
    current_reps_per_set: null,
  });

  revalidatePath('/status');
  revalidatePath('/today');
}
