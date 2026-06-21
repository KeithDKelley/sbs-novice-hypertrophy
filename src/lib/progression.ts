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
}

export function roundToIncrement(value: number, increment: number): number {
  return Math.round(value / increment) * increment;
}

export function nextStateWeighted(
  state: WeightedState,
  params: WeightedParams,
  completed: boolean,
): WeightedState {
  if (!completed) {
    return { ...state };
  }

  if (state.sets < params.endingSets) {
    return { ...state, sets: state.sets + params.setIncrease };
  } else if (state.reps < params.endingReps) {
    return { ...state, reps: state.reps + params.repsPerSetIncrease, sets: params.startingSets };
  } else {
    const newWeight = roundToIncrement(state.weight * (1 + params.weightIncrease), params.rounding);
    return {
      weight: newWeight,
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
  if (!completed) {
    return { ...state };
  }

  if (state.sets < params.endingSets) {
    return { ...state, sets: state.sets + 1 };
  } else {
    return { repsPerSet: state.repsPerSet + params.repsPerSetIncrease, sets: params.startingSets };
  }
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
    } else {
      return `Complete 1 more → ${next.sets}×${next.repsPerSet}`;
    }
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
      return `Complete 1 more → +${Math.round((params.weightIncrease) * 100)}% weight, reset to ${next.sets}×${next.reps}`;
    } else if (next.reps !== state.reps) {
      return `Complete 1 more → ${next.sets}×${next.reps}`;
    } else {
      return `Complete 1 more → ${next.sets}×${state.reps}`;
    }
  }
}
