'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { DefaultExercise } from '@/lib/defaults';

interface StartingWeightsStepProps {
  exercises: DefaultExercise[];
  weights: Record<string, number>;
  onWeightChange: (id: string, value: number) => void;
}

export function StartingWeightsStep({
  exercises,
  weights,
  onWeightChange,
}: StartingWeightsStepProps) {
  const weightedExercises = exercises.filter((e) => !e.is_bodyweight);
  const bodyweightExercises = exercises.filter((e) => e.is_bodyweight);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Starting Weights</h2>
        <p className="text-muted-foreground mt-1">
          Enter the weight you will start with for each exercise. Be conservative — you can always
          increase later.
        </p>
      </div>

      {weightedExercises.length > 0 && (
        <div className="space-y-3">
          <Badge variant="secondary">Weighted Exercises</Badge>
          <div className="space-y-3">
            {weightedExercises.map((exercise) => (
              <div key={exercise.id} className="flex items-center gap-4">
                <Label className="flex-1 text-sm">{exercise.name}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={weights[exercise.id] ?? ''}
                    onChange={(e) => onWeightChange(exercise.id, parseFloat(e.target.value) || 0)}
                    className="w-24"
                    placeholder="0"
                    min={0}
                    step={exercise.rounding}
                  />
                  <span className="text-sm text-muted-foreground">lb</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {bodyweightExercises.length > 0 && (
        <div className="space-y-3">
          <Badge variant="secondary">Bodyweight Exercises</Badge>
          <p className="text-sm text-muted-foreground">
            Enter your starting reps per set for bodyweight exercises.
          </p>
          <div className="space-y-3">
            {bodyweightExercises.map((exercise) => (
              <div key={exercise.id} className="flex items-center gap-4">
                <Label className="flex-1 text-sm">{exercise.name}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={weights[exercise.id] ?? ''}
                    onChange={(e) => onWeightChange(exercise.id, parseInt(e.target.value, 10) || 0)}
                    className="w-24"
                    placeholder="5"
                    min={1}
                    step={1}
                  />
                  <span className="text-sm text-muted-foreground">reps</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
