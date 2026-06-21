'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
    ? `BW — ${exercise.current_sets}×${exercise.current_reps_per_set ?? 5}`
    : `${(exercise.current_weight ?? 0).toFixed(1)} lb — ${exercise.current_sets}×${exercise.current_reps ?? exercise.starting_reps}`;

  return (
    <Card className={completed ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base capitalize">{exercise.name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{exercise.category}</p>
          </div>
          <Badge variant="outline" className="text-sm font-mono whitespace-nowrap">
            {prescription}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!readOnly && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onCompletedChange(true)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium border transition-colors ${
                completed
                  ? 'bg-green-500 text-white border-green-500'
                  : 'border-input hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              Completed
            </button>
            <button
              type="button"
              onClick={() => onCompletedChange(false)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium border transition-colors ${
                !completed
                  ? 'bg-red-500 text-white border-red-500'
                  : 'border-input hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              Failed / Skipped
            </button>
          </div>
        )}
        {readOnly && (
          <div
            className={`py-2 px-3 rounded-md text-sm font-medium text-center ${
              completed
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}
          >
            {completed ? 'Completed' : 'Failed / Skipped'}
          </div>
        )}
        <div>
          <Label className="text-xs text-muted-foreground">Notes (optional)</Label>
          {readOnly ? (
            notes ? (
              <p className="text-sm mt-1 text-muted-foreground">{notes}</p>
            ) : null
          ) : (
            <Textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="How did it feel? Any issues?"
              className="mt-1 min-h-[60px] text-sm"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
