'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getProfile, advanceDay } from '../db/queries/profile';
import { getExercisesForDay, updateExerciseState } from '../db/queries/exercises';
import { insertSession } from '../db/queries/sessions';
import { insertEntry } from '../db/queries/entries';
import {
  nextStateWeighted,
  nextStateBodyweight,
} from '../lib/progression';

export interface WorkoutEntryInput {
  exerciseId: string;
  completed: boolean;
  notes: string;
}

export async function logWorkout(entries: WorkoutEntryInput[]): Promise<void> {
  const profile = getProfile();
  if (!profile) throw new Error('No profile found');

  const exercises = getExercisesForDay(profile.current_day);

  const today = new Date().toISOString().slice(0, 10);
  const sessionId = insertSession({
    date: today,
    week_number: profile.current_week,
    day_number: profile.current_day,
    logged_at: new Date().toISOString(),
  });

  for (const exercise of exercises) {
    const entry = entries.find((e) => e.exerciseId === exercise.id);
    const completed = entry?.completed ?? false;
    const notes = entry?.notes ?? '';

    insertEntry({
      session_id: sessionId,
      exercise_id: exercise.id,
      prescribed_weight: exercise.current_weight,
      prescribed_sets: exercise.current_sets,
      prescribed_reps: exercise.current_reps,
      completed: completed ? 1 : 0,
      notes: notes || null,
    });

    if (exercise.is_bodyweight) {
      const state = {
        repsPerSet: exercise.current_reps_per_set ?? 5,
        sets: exercise.current_sets,
      };
      const params = {
        startingSets: exercise.starting_sets,
        endingSets: exercise.ending_sets,
        repsPerSetIncrease: exercise.reps_per_set_increase,
      };
      const next = nextStateBodyweight(state, params, completed);
      updateExerciseState(exercise.id, {
        current_weight: null,
        current_sets: next.sets,
        current_reps: null,
        current_reps_per_set: next.repsPerSet,
      });
    } else {
      const state = {
        weight: exercise.current_weight ?? 0,
        sets: exercise.current_sets,
        reps: exercise.current_reps ?? exercise.starting_reps ?? 8,
      };
      const params = {
        startingSets: exercise.starting_sets,
        endingSets: exercise.ending_sets,
        startingReps: exercise.starting_reps ?? 8,
        endingReps: exercise.ending_reps ?? 12,
        setIncrease: exercise.set_increase,
        repsPerSetIncrease: exercise.reps_per_set_increase,
        weightIncrease: exercise.weight_increase ?? 0.1,
        rounding: exercise.rounding,
      };
      const next = nextStateWeighted(state, params, completed);
      updateExerciseState(exercise.id, {
        current_weight: next.weight,
        current_sets: next.sets,
        current_reps: next.reps,
        current_reps_per_set: null,
      });
    }
  }

  advanceDay(profile.frequency);

  revalidatePath('/today');
  revalidatePath('/status');
  revalidatePath('/history');

  redirect('/today');
}
