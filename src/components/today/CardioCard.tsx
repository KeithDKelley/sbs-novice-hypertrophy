'use client';

import { useState, useTransition } from 'react';
import type { RunExercise } from '@/lib/progression';
import type { CardioLog } from '@/db/queries/cardio';
import { logCardio } from '@/actions/cardio';

interface CardioCardProps {
  run: RunExercise;
  existingLog?: CardioLog;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function CardioCard({ run, existingLog }: CardioCardProps) {
  const [isPending, startTransition] = useTransition();
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');

  const isOutdoor = run.exercise_type === 'run_outdoor';
  const isDistance = run.exercise_type === 'run_distance';

  const prescription = isOutdoor
    ? `${run.current_miles} mi · log time`
    : isDistance
    ? `${run.current_miles.toFixed(1)} mi @ 8.0 MPH`
    : `3.0 mi @ ${(run.current_mph ?? 8.0).toFixed(1)} MPH`;

  const handleLog = (completed: boolean) => {
    const timeSeconds =
      isOutdoor ? parseInt(minutes || '0') * 60 + parseInt(seconds || '0') : undefined;
    startTransition(async () => {
      await logCardio({
        exerciseId: run.id,
        exerciseType: run.exercise_type,
        completed,
        timeSeconds,
      });
    });
  };

  const done = !!existingLog;
  const succeeded = done && !!existingLog!.completed;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors ${
        done && succeeded
          ? 'border-green-500/40 bg-green-500/5'
          : done
          ? 'border-border bg-card'
          : 'border-border bg-card'
      }`}
    >
      {/* Name + prescription */}
      <div className="flex-[2] min-w-0">
        <span className="font-medium">{run.name}</span>
        <span className="ml-2 font-mono text-xs text-muted-foreground">{prescription}</span>
      </div>

      {done ? (
        // Read-only result
        <div className="flex items-center gap-2 shrink-0">
          {isOutdoor && existingLog!.time_seconds != null && (
            <span className="font-mono text-xs text-muted-foreground">
              {formatTime(existingLog!.time_seconds)}
            </span>
          )}
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${
              succeeded
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {succeeded ? '✓ Done' : '✗ Skip'}
          </span>
        </div>
      ) : (
        // Interactive controls
        <div className="flex items-center gap-2 shrink-0">
          {isOutdoor && (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="min"
                min="0"
                className="w-12 h-7 rounded border border-input bg-background px-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <span className="text-xs text-muted-foreground">:</span>
              <input
                type="number"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
                placeholder="sec"
                min="0"
                max="59"
                className="w-12 h-7 rounded border border-input bg-background px-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          )}
          <div className="flex gap-1">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleLog(true)}
              className="px-2.5 py-1 rounded text-xs font-medium border border-input hover:bg-green-500 hover:text-white hover:border-green-500 transition-colors disabled:opacity-50"
            >
              ✓
            </button>
            {!isOutdoor && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleLog(false)}
                className="px-2.5 py-1 rounded text-xs font-medium border border-input hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors disabled:opacity-50"
              >
                ✗
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
