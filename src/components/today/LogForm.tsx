'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { WorkoutCard } from './WorkoutCard';
import { logWorkout } from '@/actions/workout';
import type { Exercise } from '@/lib/progression';
import type { WorkoutEntry } from '@/db/queries/entries';

interface LogFormProps {
  exercises: Exercise[];
  existingSession?: {
    entries: (WorkoutEntry & { exercise_name: string })[];
  };
}

export function LogForm({ exercises, existingSession }: LogFormProps) {
  const [isPending, startTransition] = useTransition();
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>(() => {
    if (existingSession) {
      return Object.fromEntries(
        existingSession.entries.map((e) => [e.exercise_id, !!e.completed]),
      );
    }
    return Object.fromEntries(exercises.map((e) => [e.id, false]));
  });
  const [notesMap, setNotesMap] = useState<Record<string, string>>(() => {
    if (existingSession) {
      return Object.fromEntries(
        existingSession.entries.map((e) => [e.exercise_id, e.notes ?? '']),
      );
    }
    return Object.fromEntries(exercises.map((e) => [e.id, '']));
  });

  const readOnly = !!existingSession;

  const handleSubmit = () => {
    startTransition(async () => {
      const entries = exercises.map((ex) => ({
        exerciseId: ex.id,
        completed: completedMap[ex.id] ?? false,
        notes: notesMap[ex.id] ?? '',
      }));
      await logWorkout(entries);
    });
  };

  return (
    <div className="space-y-4">
      {exercises.map((exercise) => (
        <WorkoutCard
          key={exercise.id}
          exercise={exercise}
          completed={completedMap[exercise.id] ?? false}
          notes={notesMap[exercise.id] ?? ''}
          onCompletedChange={(val) =>
            setCompletedMap((prev) => ({ ...prev, [exercise.id]: val }))
          }
          onNotesChange={(val) => setNotesMap((prev) => ({ ...prev, [exercise.id]: val }))}
          readOnly={readOnly}
        />
      ))}
      {!readOnly && (
        <Button
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full"
          size="lg"
        >
          {isPending ? 'Saving...' : 'Log Workout & Advance'}
        </Button>
      )}
    </div>
  );
}
