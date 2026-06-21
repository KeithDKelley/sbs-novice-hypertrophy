'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FrequencyStep } from './FrequencyStep';
import { ExerciseListStep } from './ExerciseListStep';
import { StartingWeightsStep } from './StartingWeightsStep';
import { initProfile } from '@/actions/setup';
import type { DefaultExercise } from '@/lib/defaults';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface SetupWizardProps {
  defaultExercises: DefaultExercise[];
}

const STEP_LABELS = [
  'Frequency',
  'Exercises',
  'Progression Params',
  'Starting Weights',
  'Confirm',
];

export function SetupWizard({ defaultExercises }: SetupWizardProps) {
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();

  const [frequency, setFrequency] = useState(3);
  const [exercises, setExercises] = useState<DefaultExercise[]>(defaultExercises);
  const [weights, setWeights] = useState<Record<string, number>>({});

  const handleWeightChange = (id: string, value: number) => {
    setWeights((prev) => ({ ...prev, [id]: value }));
  };

  const handleExerciseParamChange = (
    index: number,
    field: keyof DefaultExercise,
    value: number,
  ) => {
    setExercises((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)),
    );
  };

  const canAdvance = () => {
    if (step === 3) {
      const weightedExercises = exercises.filter((e) => !e.is_bodyweight);
      const bwExercises = exercises.filter((e) => e.is_bodyweight);
      const allWeighted = weightedExercises.every(
        (e) => weights[e.id] != null && weights[e.id] > 0,
      );
      const allBw = bwExercises.every((e) => weights[e.id] != null && weights[e.id] > 0);
      return allWeighted && allBw;
    }
    return true;
  };

  const handleStart = () => {
    startTransition(async () => {
      const exerciseData = exercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        category: ex.category,
        is_bodyweight: ex.is_bodyweight,
        rounding: ex.rounding,
        sort_order: ex.sort_order,
        starting_sets: ex.starting_sets,
        ending_sets: ex.ending_sets,
        starting_reps: ex.starting_reps,
        ending_reps: ex.ending_reps,
        set_increase: ex.set_increase,
        reps_per_set_increase: ex.reps_per_set_increase,
        weight_increase: ex.weight_increase,
        current_weight: ex.is_bodyweight ? null : (weights[ex.id] ?? 0),
        current_reps_per_set: ex.is_bodyweight ? (weights[ex.id] ?? 5) : null,
      }));

      await initProfile({ frequency, exercises: exerciseData });
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Setup Your Program</h1>
        <p className="text-muted-foreground mt-1">
          Step {step + 1} of {STEP_LABELS.length}: {STEP_LABELS[step]}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${((step + 1) / STEP_LABELS.length) * 100}%` }}
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          {step === 0 && (
            <FrequencyStep value={frequency} onChange={setFrequency} />
          )}
          {step === 1 && (
            <ExerciseListStep exercises={exercises} onChange={setExercises} />
          )}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Progression Parameters</h2>
                <p className="text-muted-foreground mt-1">
                  Advanced settings. The defaults work well for most people.
                </p>
              </div>
              <Accordion type="multiple" className="w-full">
                {exercises.map((ex, index) => (
                  <AccordionItem key={ex.id} value={ex.id}>
                    <AccordionTrigger className="capitalize text-sm">
                      {ex.name}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Starting Sets</Label>
                          <Input
                            type="number"
                            value={ex.starting_sets}
                            onChange={(e) =>
                              handleExerciseParamChange(
                                index,
                                'starting_sets',
                                parseInt(e.target.value, 10) || 3,
                              )
                            }
                            min={1}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Ending Sets</Label>
                          <Input
                            type="number"
                            value={ex.ending_sets}
                            onChange={(e) =>
                              handleExerciseParamChange(
                                index,
                                'ending_sets',
                                parseInt(e.target.value, 10) || 5,
                              )
                            }
                            min={1}
                            className="h-8 text-sm"
                          />
                        </div>
                        {!ex.is_bodyweight && (
                          <>
                            <div className="space-y-1">
                              <Label className="text-xs">Starting Reps</Label>
                              <Input
                                type="number"
                                value={ex.starting_reps ?? 8}
                                onChange={(e) =>
                                  handleExerciseParamChange(
                                    index,
                                    'starting_reps',
                                    parseInt(e.target.value, 10) || 8,
                                  )
                                }
                                min={1}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Ending Reps</Label>
                              <Input
                                type="number"
                                value={ex.ending_reps ?? 12}
                                onChange={(e) =>
                                  handleExerciseParamChange(
                                    index,
                                    'ending_reps',
                                    parseInt(e.target.value, 10) || 12,
                                  )
                                }
                                min={1}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Weight Increase (%)</Label>
                              <Input
                                type="number"
                                value={Math.round((ex.weight_increase ?? 0.1) * 100)}
                                onChange={(e) =>
                                  handleExerciseParamChange(
                                    index,
                                    'weight_increase',
                                    (parseInt(e.target.value, 10) || 10) / 100,
                                  )
                                }
                                min={1}
                                max={50}
                                className="h-8 text-sm"
                              />
                            </div>
                          </>
                        )}
                        <div className="space-y-1">
                          <Label className="text-xs">Reps per Set Increase</Label>
                          <Input
                            type="number"
                            value={ex.reps_per_set_increase}
                            onChange={(e) =>
                              handleExerciseParamChange(
                                index,
                                'reps_per_set_increase',
                                parseInt(e.target.value, 10) || 2,
                              )
                            }
                            min={1}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Rounding (lb)</Label>
                          <Input
                            type="number"
                            value={ex.rounding}
                            onChange={(e) =>
                              handleExerciseParamChange(
                                index,
                                'rounding',
                                parseFloat(e.target.value) || 5,
                              )
                            }
                            min={1}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
          {step === 3 && (
            <StartingWeightsStep
              exercises={exercises}
              weights={weights}
              onWeightChange={handleWeightChange}
            />
          )}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Confirm & Start</h2>
                <p className="text-muted-foreground mt-1">
                  Review your setup before starting the program.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Training frequency</span>
                  <span className="font-medium">{frequency} days/week</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total exercises</span>
                  <span className="font-medium">{exercises.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bodyweight exercises</span>
                  <span className="font-medium">{exercises.filter((e) => e.is_bodyweight).length}</span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Starting weights summary:</p>
                  {exercises.map((ex) => (
                    <div key={ex.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{ex.name}</span>
                      <span className="font-mono font-medium">
                        {ex.is_bodyweight
                          ? `${weights[ex.id] ?? 5} reps`
                          : `${(weights[ex.id] ?? 0).toFixed(1)} lb`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0 || isPending}
          >
            Back
          </Button>
          {step < STEP_LABELS.length - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance()}
            >
              Next
            </Button>
          ) : (
            <Button onClick={handleStart} disabled={isPending}>
              {isPending ? 'Starting...' : 'Start Program'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
