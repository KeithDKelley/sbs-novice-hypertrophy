'use server';

import db from '@/db/client';
import { getProfile } from '@/db/queries/profile';
import { insertCardioLog } from '@/db/queries/cardio';
import { nextRunDistanceState, nextRunSpeedState } from '@/lib/progression';
import type { RunExercise } from '@/lib/progression';
import { revalidatePath } from 'next/cache';

export async function logCardio(input: {
  exerciseId: string;
  exerciseType: 'run_distance' | 'run_speed' | 'run_outdoor';
  completed: boolean;
  timeSeconds?: number;
}): Promise<void> {
  const profile = getProfile();
  if (!profile) throw new Error('No profile found');

  const run = db.prepare('SELECT * FROM exercises WHERE id = ?').get(input.exerciseId) as RunExercise;
  if (!run) throw new Error(`Run exercise not found: ${input.exerciseId}`);

  insertCardioLog({
    exercise_id: input.exerciseId,
    date: new Date().toISOString().split('T')[0],
    week_number: profile.current_week,
    completed: input.completed ? 1 : 0,
    prescribed_miles: run.current_miles,
    prescribed_mph: run.current_mph,
    time_seconds: input.timeSeconds ?? null,
    logged_at: new Date().toISOString(),
  });

  if (input.exerciseType === 'run_distance') {
    const next = nextRunDistanceState(
      { miles: run.current_miles, consecutiveFailures: run.consecutive_failures ?? 0 },
      input.completed,
    );
    db.prepare('UPDATE exercises SET current_miles = ?, consecutive_failures = ? WHERE id = ?')
      .run(next.miles, next.consecutiveFailures, input.exerciseId);
  } else if (input.exerciseType === 'run_speed') {
    const next = nextRunSpeedState(
      { mph: run.current_mph ?? 8.0, consecutiveFailures: run.consecutive_failures ?? 0 },
      input.completed,
    );
    db.prepare('UPDATE exercises SET current_mph = ?, consecutive_failures = ? WHERE id = ?')
      .run(next.mph, next.consecutiveFailures, input.exerciseId);
  }
  // run_outdoor: no state change — it's always 6.25 miles

  revalidatePath('/today');
  revalidatePath('/status');
}
