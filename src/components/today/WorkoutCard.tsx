'use client';

import type { Exercise } from '@/lib/progression';

interface WorkoutCardProps {
  exercise: Exercise;
  completed: boolean;
  notes: string;
  onCompletedChange: (completed: boolean) => void;
  onNotesChange: (notes: string) => void;
  readOnly?: boolean;
}

export function WorkoutCard({
  exercise,
  completed,
  notes,
  onCompletedChange,
  onNotesChange,
  readOnly = false,
}: WorkoutCardProps) {
  const prescription = exercise.is_bodyweight
    ? `BW · ${exercise.current_sets}×${exercise.current_reps_per_set ?? 5}`
    : `${(exercise.current_weight ?? 0).toFixed(1)} lb · ${exercise.current_sets}×${exercise.current_reps ?? exercise.starting_reps}`;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors ${
        completed
          ? 'border-green-400 bg-green-50 dark:bg-green-950/20'
          : 'border-border bg-card'
      }`}
    >
      {/* Name + prescription */}
      <div className="flex-[2] min-w-0">
        <span className="font-medium capitalize">{exercise.name}</span>
        <span className="ml-2 font-mono text-xs text-muted-foreground whitespace-nowrap">
          {prescription}
        </span>
      </div>

      {/* Complete / Fail buttons */}
      {readOnly ? (
        <span
          className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded ${
            completed
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {completed ? '✓ Done' : '✗ Skip'}
        </span>
      ) : (
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => onCompletedChange(true)}
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
              completed
                ? 'bg-green-500 text-white border-green-500'
                : 'border-input hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            ✓
          </button>
          <button
            type="button"
            onClick={() => onCompletedChange(false)}
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
              !completed
                ? 'bg-red-500 text-white border-red-500'
                : 'border-input hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            ✗
          </button>
        </div>
      )}

      {/* Notes */}
      {readOnly ? (
        notes ? (
          <span className="flex-1 min-w-0 text-xs text-muted-foreground truncate">{notes}</span>
        ) : (
          <span className="flex-1" />
        )
      ) : (
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="notes…"
          rows={1}
          className="flex-1 min-w-0 rounded border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring resize-y overflow-auto"
          style={{ minHeight: '1.75rem' }}
        />
      )}
    </div>
  );
}
