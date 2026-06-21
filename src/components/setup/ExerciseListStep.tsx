'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { DefaultExercise } from '@/lib/defaults';
import { EXERCISE_OPTIONS } from '@/lib/defaults';

interface ExerciseListStepProps {
  exercises: DefaultExercise[];
  onChange: (exercises: DefaultExercise[]) => void;
}

// Derive which slots start in "Other" mode: those whose current name isn't in their category's option list.
function initOtherMode(exercises: DefaultExercise[]): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  for (const ex of exercises) {
    const options = EXERCISE_OPTIONS[ex.category] ?? [];
    if (options.length > 0 && !options.some((o) => o.name === ex.name)) {
      result[ex.id] = true;
    }
  }
  return result;
}

const SELECT_CLASSES =
  'w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ' +
  'ring-offset-background focus-visible:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-ring focus-visible:ring-offset-2 h-9';

export function ExerciseListStep({ exercises, onChange }: ExerciseListStepProps) {
  const [otherMode, setOtherMode] = useState<Record<string, boolean>>(() =>
    initOtherMode(exercises),
  );

  const updateExercise = (index: number, updates: Partial<DefaultExercise>) => {
    onChange(exercises.map((ex, i) => (i === index ? { ...ex, ...updates } : ex)));
  };

  const handleSelectChange = (index: number, selectedName: string) => {
    const exercise = exercises[index];
    const options = EXERCISE_OPTIONS[exercise.category] ?? [];

    if (selectedName === '__other__') {
      setOtherMode((prev) => ({ ...prev, [exercise.id]: true }));
      updateExercise(index, { name: '' });
    } else {
      setOtherMode((prev) => ({ ...prev, [exercise.id]: false }));
      const option = options.find((o) => o.name === selectedName);
      if (option) {
        updateExercise(index, {
          name: option.name,
          is_bodyweight: option.isBodyweight,
          starting_reps: option.isBodyweight ? null : (exercise.starting_reps ?? 8),
          ending_reps: option.isBodyweight ? null : (exercise.ending_reps ?? 12),
          weight_increase: option.isBodyweight ? null : (exercise.weight_increase ?? 0.1),
        });
      }
    }
  };

  const handleBodyweightToggle = (index: number, checked: boolean) => {
    const exercise = exercises[index];
    updateExercise(index, {
      is_bodyweight: checked,
      starting_reps: checked ? null : (exercise.starting_reps ?? 8),
      ending_reps: checked ? null : (exercise.ending_reps ?? 12),
      weight_increase: checked ? null : (exercise.weight_increase ?? 0.1),
    });
  };

  const categories = Array.from(new Set(exercises.map((e) => e.category)));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Exercises</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Choose an exercise for each slot. All options are appropriate for that movement
          pattern. Select <em>Other</em> to enter any exercise you like.
        </p>
      </div>

      {categories.map((category) => {
        const options = EXERCISE_OPTIONS[category] ?? [];
        const isVanity = options.length === 0;
        const categoryExercises = exercises.filter((e) => e.category === category);

        return (
          <div key={category} className="space-y-2">
            <Badge variant="secondary" className="capitalize">
              {category}
            </Badge>

            <div className="space-y-2">
              {categoryExercises.map((exercise) => {
                const index = exercises.indexOf(exercise);
                const isOther = otherMode[exercise.id] ?? false;
                const selectValue = isOther ? '__other__' : exercise.name;

                return (
                  <div
                    key={exercise.id}
                    className="flex flex-col gap-2 p-3 border rounded-md"
                  >
                    {/* Exercise name — dropdown for structured categories, plain input for vanity */}
                    {isVanity ? (
                      <Input
                        value={exercise.name}
                        onChange={(e) => updateExercise(index, { name: e.target.value })}
                        placeholder="Enter exercise name…"
                        className="h-9 text-sm"
                      />
                    ) : (
                      <>
                        <select
                          value={selectValue}
                          onChange={(e) => handleSelectChange(index, e.target.value)}
                          className={SELECT_CLASSES}
                        >
                          {options.map((opt) => (
                            <option key={opt.name} value={opt.name}>
                              {opt.name}
                              {opt.isBodyweight ? ' (bodyweight)' : ''}
                            </option>
                          ))}
                          <option value="__other__">Other (custom)…</option>
                        </select>

                        {isOther && (
                          <Input
                            value={exercise.name}
                            onChange={(e) => updateExercise(index, { name: e.target.value })}
                            placeholder="Enter exercise name…"
                            className="h-9 text-sm"
                          />
                        )}
                      </>
                    )}

                    {/* Secondary controls */}
                    <div className="flex items-center gap-6 text-sm">
                      {/* Bodyweight toggle — locked for presets, editable for Other/Vanity */}
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`bw-${exercise.id}`}
                          checked={exercise.is_bodyweight}
                          disabled={!isVanity && !isOther}
                          onCheckedChange={(checked) =>
                            handleBodyweightToggle(index, !!checked)
                          }
                        />
                        <Label
                          htmlFor={`bw-${exercise.id}`}
                          className={`text-xs ${!isVanity && !isOther ? 'text-muted-foreground/50 cursor-default' : 'text-muted-foreground cursor-pointer'}`}
                        >
                          Bodyweight
                        </Label>
                      </div>

                      {/* Rounding increment */}
                      <div className="flex items-center gap-2 ml-auto">
                        <Label className="text-xs text-muted-foreground whitespace-nowrap">
                          Round to
                        </Label>
                        <Input
                          type="number"
                          value={exercise.rounding}
                          onChange={(e) =>
                            updateExercise(index, {
                              rounding: parseFloat(e.target.value) || 5,
                            })
                          }
                          className="h-8 w-16 text-sm"
                          min={0.25}
                          step={0.25}
                        />
                        <span className="text-xs text-muted-foreground">lb</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
