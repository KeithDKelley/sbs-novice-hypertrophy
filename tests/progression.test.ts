import { describe, it, expect } from 'vitest';
import {
  nextStateWeighted,
  nextStateBodyweight,
  nextRunDistanceState,
  nextRunSpeedState,
  roundToIncrement,
  type WeightedState,
  type WeightedParams,
  type BodyweightState,
  type BodyweightParams,
  type RunDistanceState,
  type RunSpeedState,
} from '../src/lib/progression';

const DEFAULT_WEIGHTED_PARAMS: WeightedParams = {
  startingSets: 3,
  endingSets: 5,
  startingReps: 8,
  endingReps: 12,
  setIncrease: 1,
  repsPerSetIncrease: 2,
  weightIncrease: 0.1,
  rounding: 5,
};

const DEFAULT_BODYWEIGHT_PARAMS: BodyweightParams = {
  startingSets: 3,
  endingSets: 5,
  repsPerSetIncrease: 2,
};

describe('roundToIncrement', () => {
  it('rounds to nearest 5', () => {
    expect(roundToIncrement(103, 5)).toBe(105);
    expect(roundToIncrement(101, 5)).toBe(100);
    expect(roundToIncrement(102.5, 5)).toBe(105);
    expect(roundToIncrement(100, 5)).toBe(100);
  });

  it('rounds to nearest 2.5', () => {
    expect(roundToIncrement(101, 2.5)).toBe(100);
    expect(roundToIncrement(101.5, 2.5)).toBe(102.5);
    expect(roundToIncrement(103.8, 2.5)).toBe(105);
  });

  it('rounds to nearest 10', () => {
    expect(roundToIncrement(104, 10)).toBe(100);
    expect(roundToIncrement(105, 10)).toBe(110);
    expect(roundToIncrement(95, 10)).toBe(100);
  });

  it('handles exact values', () => {
    expect(roundToIncrement(100, 5)).toBe(100);
    expect(roundToIncrement(110, 10)).toBe(110);
  });

  it('100 * 1.1 = 110 rounded to 5', () => {
    expect(roundToIncrement(100 * 1.1, 5)).toBe(110);
  });
});

describe('nextStateWeighted - failure', () => {
  it('returns unchanged state on failure', () => {
    const state: WeightedState = { weight: 100, sets: 3, reps: 8 };
    const next = nextStateWeighted(state, DEFAULT_WEIGHTED_PARAMS, false);
    expect(next).toEqual(state);
    expect(next).not.toBe(state); // should be a copy
  });

  it('returns unchanged state on failure mid-cycle', () => {
    const state: WeightedState = { weight: 100, sets: 4, reps: 10 };
    const next = nextStateWeighted(state, DEFAULT_WEIGHTED_PARAMS, false);
    expect(next).toEqual(state);
  });
});

describe('nextStateWeighted - full cycle at 100 lb', () => {
  const params = DEFAULT_WEIGHTED_PARAMS;

  // Full cycle: 3×8 → 4×8 → 5×8 → 3×10 → 4×10 → 5×10 → 3×12 → 4×12 → 5×12 → 110lb 3×8 → ...

  it('3×8 → 4×8 (add a set)', () => {
    const state: WeightedState = { weight: 100, sets: 3, reps: 8 };
    const next = nextStateWeighted(state, params, true);
    expect(next).toEqual({ weight: 100, sets: 4, reps: 8 });
  });

  it('4×8 → 5×8 (add a set)', () => {
    const state: WeightedState = { weight: 100, sets: 4, reps: 8 };
    const next = nextStateWeighted(state, params, true);
    expect(next).toEqual({ weight: 100, sets: 5, reps: 8 });
  });

  it('5×8 → 3×10 (max sets reached, increase reps, reset sets)', () => {
    const state: WeightedState = { weight: 100, sets: 5, reps: 8 };
    const next = nextStateWeighted(state, params, true);
    expect(next).toEqual({ weight: 100, sets: 3, reps: 10 });
  });

  it('3×10 → 4×10 (add a set)', () => {
    const state: WeightedState = { weight: 100, sets: 3, reps: 10 };
    const next = nextStateWeighted(state, params, true);
    expect(next).toEqual({ weight: 100, sets: 4, reps: 10 });
  });

  it('4×10 → 5×10 (add a set)', () => {
    const state: WeightedState = { weight: 100, sets: 4, reps: 10 };
    const next = nextStateWeighted(state, params, true);
    expect(next).toEqual({ weight: 100, sets: 5, reps: 10 });
  });

  it('5×10 → 3×12 (max sets reached, increase reps, reset sets)', () => {
    const state: WeightedState = { weight: 100, sets: 5, reps: 10 };
    const next = nextStateWeighted(state, params, true);
    expect(next).toEqual({ weight: 100, sets: 3, reps: 12 });
  });

  it('3×12 → 4×12 (add a set)', () => {
    const state: WeightedState = { weight: 100, sets: 3, reps: 12 };
    const next = nextStateWeighted(state, params, true);
    expect(next).toEqual({ weight: 100, sets: 4, reps: 12 });
  });

  it('4×12 → 5×12 (add a set)', () => {
    const state: WeightedState = { weight: 100, sets: 4, reps: 12 };
    const next = nextStateWeighted(state, params, true);
    expect(next).toEqual({ weight: 100, sets: 5, reps: 12 });
  });

  it('5×12 → 110 lb 3×8 (max reps and sets reached, increase weight, reset)', () => {
    const state: WeightedState = { weight: 100, sets: 5, reps: 12 };
    const next = nextStateWeighted(state, params, true);
    expect(next).toEqual({ weight: 110, sets: 3, reps: 8 });
  });

  it('continues the cycle at 110 lb: 3×8 → 4×8', () => {
    const state: WeightedState = { weight: 110, sets: 3, reps: 8 };
    const next = nextStateWeighted(state, params, true);
    expect(next).toEqual({ weight: 110, sets: 4, reps: 8 });
  });

  it('110 lb 5×12 → 121 lb rounded to 120 (nearest 5)', () => {
    const state: WeightedState = { weight: 110, sets: 5, reps: 12 };
    const next = nextStateWeighted(state, params, true);
    // 110 * 1.1 = 121, rounded to nearest 5 = 120
    expect(next).toEqual({ weight: 120, sets: 3, reps: 8 });
  });
});

describe('nextStateWeighted - full sequential cycle simulation', () => {
  it('runs through the complete 9-step cycle correctly', () => {
    const params = DEFAULT_WEIGHTED_PARAMS;
    let state: WeightedState = { weight: 100, sets: 3, reps: 8 };

    const expectedStates: WeightedState[] = [
      { weight: 100, sets: 4, reps: 8 },
      { weight: 100, sets: 5, reps: 8 },
      { weight: 100, sets: 3, reps: 10 },
      { weight: 100, sets: 4, reps: 10 },
      { weight: 100, sets: 5, reps: 10 },
      { weight: 100, sets: 3, reps: 12 },
      { weight: 100, sets: 4, reps: 12 },
      { weight: 100, sets: 5, reps: 12 },
      { weight: 110, sets: 3, reps: 8 },
    ];

    for (const expected of expectedStates) {
      state = nextStateWeighted(state, params, true);
      expect(state).toEqual(expected);
    }
  });
});

describe('nextStateBodyweight', () => {
  const params = DEFAULT_BODYWEIGHT_PARAMS;

  it('3×5 → 4×5 (add a set)', () => {
    const state: BodyweightState = { repsPerSet: 5, sets: 3 };
    const next = nextStateBodyweight(state, params, true);
    expect(next).toEqual({ repsPerSet: 5, sets: 4 });
  });

  it('4×5 → 5×5 (add a set)', () => {
    const state: BodyweightState = { repsPerSet: 5, sets: 4 };
    const next = nextStateBodyweight(state, params, true);
    expect(next).toEqual({ repsPerSet: 5, sets: 5 });
  });

  it('5×5 → 3×7 (max sets, increase reps, reset sets)', () => {
    const state: BodyweightState = { repsPerSet: 5, sets: 5 };
    const next = nextStateBodyweight(state, params, true);
    expect(next).toEqual({ repsPerSet: 7, sets: 3 });
  });

  it('3×7 → 4×7 (add a set)', () => {
    const state: BodyweightState = { repsPerSet: 7, sets: 3 };
    const next = nextStateBodyweight(state, params, true);
    expect(next).toEqual({ repsPerSet: 7, sets: 4 });
  });

  it('returns unchanged state on failure', () => {
    const state: BodyweightState = { repsPerSet: 5, sets: 3 };
    const next = nextStateBodyweight(state, params, false);
    expect(next).toEqual(state);
    expect(next).not.toBe(state); // should be a copy
  });

  it('runs through the full bodyweight cycle', () => {
    let state: BodyweightState = { repsPerSet: 5, sets: 3 };

    const expected = [
      { repsPerSet: 5, sets: 4 },
      { repsPerSet: 5, sets: 5 },
      { repsPerSet: 7, sets: 3 },
      { repsPerSet: 7, sets: 4 },
      { repsPerSet: 7, sets: 5 },
      { repsPerSet: 9, sets: 3 },
    ];

    for (const exp of expected) {
      state = nextStateBodyweight(state, params, true);
      expect(state).toEqual(exp);
    }
  });
});

describe('nextRunDistanceState', () => {
  it('advances 0.5 miles on success and resets consecutive failures', () => {
    const s: RunDistanceState = { miles: 3.0, consecutiveFailures: 0 };
    expect(nextRunDistanceState(s, true)).toEqual({ miles: 3.5, consecutiveFailures: 0 });
  });

  it('caps at 6.25 miles', () => {
    const s: RunDistanceState = { miles: 6.0, consecutiveFailures: 0 };
    expect(nextRunDistanceState(s, true)).toEqual({ miles: 6.25, consecutiveFailures: 0 });
  });

  it('stays at 6.25 once reached', () => {
    const s: RunDistanceState = { miles: 6.25, consecutiveFailures: 0 };
    expect(nextRunDistanceState(s, true)).toEqual({ miles: 6.25, consecutiveFailures: 0 });
  });

  it('increments consecutive_failures on first fail without moving state back', () => {
    const s: RunDistanceState = { miles: 4.0, consecutiveFailures: 0 };
    expect(nextRunDistanceState(s, false)).toEqual({ miles: 4.0, consecutiveFailures: 1 });
  });

  it('goes back one step on second consecutive fail', () => {
    const s: RunDistanceState = { miles: 4.0, consecutiveFailures: 1 };
    expect(nextRunDistanceState(s, false)).toEqual({ miles: 3.5, consecutiveFailures: 0 });
  });

  it('does not go below 3.0 miles', () => {
    const s: RunDistanceState = { miles: 3.0, consecutiveFailures: 1 };
    expect(nextRunDistanceState(s, false)).toEqual({ miles: 3.0, consecutiveFailures: 0 });
  });

  it('resets consecutive failures after a success', () => {
    const s: RunDistanceState = { miles: 3.5, consecutiveFailures: 1 };
    expect(nextRunDistanceState(s, true)).toEqual({ miles: 4.0, consecutiveFailures: 0 });
  });
});

describe('nextRunSpeedState', () => {
  it('advances 0.2 MPH on success', () => {
    const s: RunSpeedState = { mph: 8.0, consecutiveFailures: 0 };
    expect(nextRunSpeedState(s, true)).toEqual({ mph: 8.2, consecutiveFailures: 0 });
  });

  it('caps at 9.6 MPH', () => {
    const s: RunSpeedState = { mph: 9.4, consecutiveFailures: 0 };
    expect(nextRunSpeedState(s, true)).toEqual({ mph: 9.6, consecutiveFailures: 0 });
  });

  it('increments consecutive_failures on first fail', () => {
    const s: RunSpeedState = { mph: 8.6, consecutiveFailures: 0 };
    expect(nextRunSpeedState(s, false)).toEqual({ mph: 8.6, consecutiveFailures: 1 });
  });

  it('goes back 0.2 MPH on second consecutive fail', () => {
    const s: RunSpeedState = { mph: 8.6, consecutiveFailures: 1 };
    expect(nextRunSpeedState(s, false)).toEqual({ mph: 8.4, consecutiveFailures: 0 });
  });

  it('does not go below 8.0 MPH', () => {
    const s: RunSpeedState = { mph: 8.0, consecutiveFailures: 1 };
    expect(nextRunSpeedState(s, false)).toEqual({ mph: 8.0, consecutiveFailures: 0 });
  });
});
