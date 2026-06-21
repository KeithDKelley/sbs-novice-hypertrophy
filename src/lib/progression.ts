export interface WeightedState {
  weight: number;
  sets: number;
  reps: number;
}

export interface WeightedParams {
  startingSets: number;
  endingSets: number;
  startingReps: number;
  endingReps: number;
  setIncrease: number;
  repsPerSetIncrease: number;
  weightIncrease: number;
  rounding: number;
}

export interface BodyweightState {
  repsPerSet: number;
  sets: number;
}

export interface BodyweightParams {
  startingSets: number;
  endingSets: number;
  repsPerSetIncrease: number;
}

export interface RunDistanceState {
  miles: number;
  consecutiveFailures: number;
}

export interface RunSpeedState {
  mph: number;
  consecutiveFailures: number;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  is_bodyweight: number;
  rounding: number;
  sort_order: number;
  starting_sets: number;
  ending_sets: number;
  starting_reps: number | null;
  ending_reps: number | null;
  set_increase: number;
  reps_per_set_increase: number;
  weight_increase: number | null;
  current_weight: number | null;
  current_sets: number;
  current_reps: number | null;
  current_reps_per_set: number | null;
  exercise_type?: string;
}

export interface RunExercise {
  id: string;
  name: string;
  exercise_type: 'run_distance' | 'run_speed' | 'run_outdoor';
  current_miles: number;
  current_mph: number | null;
  consecutive_failures: number;
}

export function roundToIncrement(value: number, increment: number): number {
  return Math.round(value / increment) * increment;
}

export function nextStateWeighted(
  state: WeightedState,
  params: WeightedParams,
  completed: boolean,
): WeightedState {
  if (!completed) return { ...state };

  if (state.sets < params.endingSets) {
    return { ...state, sets: state.sets + params.setIncrease };
  } else if (state.reps < params.endingReps) {
    return { ...state, reps: state.reps + params.repsPerSetIncrease, sets: params.startingSets };
  } else {
    return {
      weight: roundToIncrement(state.weight * (1 + params.weightIncrease), params.rounding),
      sets: params.startingSets,
      reps: params.startingReps,
    };
  }
}

export function nextStateBodyweight(
  state: BodyweightState,
  params: BodyweightParams,
  completed: boolean,
): BodyweightState {
  if (!completed) return { ...state };

  if (state.sets < params.endingSets) {
    return { ...state, sets: state.sets + 1 };
  } else {
    return { repsPerSet: state.repsPerSet + params.repsPerSetIncrease, sets: params.startingSets };
  }
}

// Long-distance run: +0.5 miles on success (max 6.25), repeat on first fail,
// go back 0.5 miles on two consecutive fails (min 3.0).
export function nextRunDistanceState(
  state: RunDistanceState,
  completed: boolean,
): RunDistanceState {
  if (completed) {
    const next = Math.min(roundToIncrement(state.miles + 0.5, 0.25), 6.25);
    return { miles: next, consecutiveFailures: 0 };
  }
  const newFailures = state.consecutiveFailures + 1;
  if (newFailures >= 2) {
    const prev = Math.max(roundToIncrement(state.miles - 0.5, 0.25), 3.0);
    return { miles: prev, consecutiveFailures: 0 };
  }
  return { ...state, consecutiveFailures: newFailures };
}

// Speed run: +0.2 MPH on success (max 9.6), repeat on first fail,
// go back 0.2 MPH on two consecutive fails (min 8.0).
// Use integer arithmetic (* 10) to avoid 0.1 floating-point errors.
export function nextRunSpeedState(
  state: RunSpeedState,
  completed: boolean,
): RunSpeedState {
  const snapMph = (v: number) => Math.round(v * 10) / 10;
  if (completed) {
    const next = Math.min(snapMph(state.mph + 0.2), 9.6);
    return { mph: next, consecutiveFailures: 0 };
  }
  const newFailures = state.consecutiveFailures + 1;
  if (newFailures >= 2) {
    const prev = Math.max(snapMph(state.mph - 0.2), 8.0);
    return { mph: prev, consecutiveFailures: 0 };
  }
  return { ...state, consecutiveFailures: newFailures };
}

export function describeNextMilestone(exercise: Exercise): string {
  if (exercise.is_bodyweight) {
    const state: BodyweightState = {
      repsPerSet: exercise.current_reps_per_set ?? 5,
      sets: exercise.current_sets,
    };
    const params: BodyweightParams = {
      startingSets: exercise.starting_sets,
      endingSets: exercise.ending_sets,
      repsPerSetIncrease: exercise.reps_per_set_increase,
    };
    const next = nextStateBodyweight(state, params, true);
    if (next.sets !== state.sets) {
      return `Complete 1 more → ${next.sets}×${state.repsPerSet}`;
    }
    return `Complete 1 more → ${next.sets}×${next.repsPerSet}`;
  } else {
    const weight = exercise.current_weight ?? 0;
    const state: WeightedState = {
      weight,
      sets: exercise.current_sets,
      reps: exercise.current_reps ?? exercise.starting_reps ?? 8,
    };
    const params: WeightedParams = {
      startingSets: exercise.starting_sets,
      endingSets: exercise.ending_sets,
      startingReps: exercise.starting_reps ?? 8,
      endingReps: exercise.ending_reps ?? 12,
      setIncrease: exercise.set_increase,
      repsPerSetIncrease: exercise.reps_per_set_increase,
      weightIncrease: exercise.weight_increase ?? 0.1,
      rounding: exercise.rounding,
    };
    const next = nextStateWeighted(state, params, true);
    if (next.weight !== state.weight) {
      return `Complete 1 more → +${Math.round(params.weightIncrease * 100)}% weight, reset to ${next.sets}×${next.reps}`;
    } else if (next.reps !== state.reps) {
      return `Complete 1 more → ${next.sets}×${next.reps}`;
    }
    return `Complete 1 more → ${next.sets}×${state.reps}`;
  }
}
