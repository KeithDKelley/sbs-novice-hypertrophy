'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { WorkoutSession } from '@/db/queries/sessions';
import type { WorkoutEntry } from '@/db/queries/entries';

interface SessionCardProps {
  session: WorkoutSession;
  entries: (WorkoutEntry & { exercise_name: string })[];
}

export function SessionCard({ session, entries }: SessionCardProps) {
  const [open, setOpen] = useState(false);

  const completedCount = entries.filter((e) => e.completed).length;

  return (
    <div className="border rounded-lg">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {open ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <div>
            <p className="font-medium">
              Week {session.week_number} · Day {session.day_number}
            </p>
            <p className="text-sm text-muted-foreground">{session.date}</p>
          </div>
        </div>
        <Badge variant="secondary">
          {completedCount}/{entries.length} completed
        </Badge>
      </button>
      {open && (
        <div className="border-t px-4 pb-4 pt-3 space-y-2">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between text-sm">
              <span className="capitalize text-muted-foreground">{entry.exercise_name}</span>
              <div className="flex items-center gap-2">
                {entry.prescribed_weight != null ? (
                  <span className="font-mono text-xs">
                    {entry.prescribed_weight.toFixed(1)} lb ·{' '}
                    {entry.prescribed_sets}×{entry.prescribed_reps}
                  </span>
                ) : (
                  <span className="font-mono text-xs">
                    BW · {entry.prescribed_sets}×{entry.prescribed_reps ?? '?'}
                  </span>
                )}
                <Badge
                  variant={entry.completed ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {entry.completed ? 'Done' : 'Skip'}
                </Badge>
              </div>
            </div>
          ))}
          {entries.some((e) => e.notes) && (
            <div className="mt-2 pt-2 border-t space-y-1">
              {entries
                .filter((e) => e.notes)
                .map((entry) => (
                  <p key={entry.id} className="text-xs text-muted-foreground">
                    <span className="font-medium capitalize">{entry.exercise_name}:</span>{' '}
                    {entry.notes}
                  </p>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
