# SBS Novice Hypertrophy — Web App Implementation Plan

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router) | Full-stack TypeScript; Server Actions remove the need for a separate API layer |
| Language | TypeScript (strict) | Throughout: UI, server logic, DB queries |
| Database | SQLite via `better-sqlite3` | Single-file, zero infra, synchronous (perfect for Server Actions) |
| Styling | Tailwind CSS + shadcn/ui | Fast component primitives, no design system to build from scratch |
| Dev tooling | ESLint, Prettier, Vitest | |

No ORMs. `better-sqlite3` is used directly with typed wrapper functions.

---

## Program logic (source: spreadsheet + Instructions.docx)

### Weighted exercise progression (3-step cycle)

State per exercise: `{ weight: number, sets: number, reps: number }`

On **successful** completion:
1. If `sets < endingSets` → `sets += setIncrease`
2. Else if `reps < endingReps` → `reps += repsPerSetIncrease`, `sets = startingSets`
3. Else → `weight = roundToIncrement(weight * (1 + weightIncrease), rounding)`, `sets = startingSets`, `reps = startingReps`

On **failure** → state unchanged.

**Default params (per-exercise, all configurable):**
```
startingSets: 3      endingSets: 5
startingReps: 8      endingReps: 12
setIncrease: 1       repsPerSetIncrease: 2
weightIncrease: 0.10 rounding: 5 (lbs)
```

Full default cycle at 100 lb: `3×8 → 4×8 → 5×8 → 3×10 → 4×10 → 5×10 → 3×12 → 4×12 → 5×12 → 110lb 3×8 → ...`

### Bodyweight exercise progression (2-step cycle)

State: `{ repsPerSet: number, sets: number }`

On **success:**
1. If `sets < endingSets` → `sets += 1`
2. Else → `repsPerSet += repsPerSetIncrease`, `sets = startingSets`

---

## Default exercise list

| Category | Exercises | BW? |
|---|---|---|
| Compound, pec-dominant | dumbbell bench press, dumbbell incline press | no |
| Compound, shoulder-dominant | seated dumbbell shoulder press, machine shoulder press | no |
| Upper back horizontal | bent over row, seated cable row | no |
| Upper back vertical | neutral grip pull-up, reverse grip pull-down | yes / no |
| Hip-dominant | romanian deadlift, back extension | no |
| Knee-dominant | barbell squat, leg press | no |
| Hip-dominant accessory | seated hamstrings curl | no |
| Quad-dominant accessory | split squats | no |
| Calves | leg press calf raises, seated calf raises | no |
| Vanity | preacher curls, skullcrushers, dumbbell rear delt raises, barbell shrugs, dumbbell flyes, dumbbell side delt raises | no |

---

## Training splits

### 3x/week
| Day | Exercises |
|---|---|
| 1 | dumbbell bench press, bent over row, machine shoulder press, reverse grip pull-down, dumbbell incline press, seated cable row, preacher curls, skullcrushers |
| 2 | barbell squat, romanian deadlift, leg press, back extension, split squats, leg press calf raises, dumbbell rear delt raises |
| 3 | seated dumbbell shoulder press, neutral grip pull-up, seated hamstrings curl, seated calf raises, barbell shrugs, dumbbell flyes, dumbbell side delt raises |

### 4x/week
| Day | Exercises |
|---|---|
| 1 | dumbbell bench press, bent over row, machine shoulder press, reverse grip pull-down, preacher curls, skullcrushers |
| 2 | barbell squat, back extension, split squats, leg press calf raises, dumbbell rear delt raises |
| 3 | seated dumbbell shoulder press, neutral grip pull-up, dumbbell incline press, seated cable row, barbell shrugs, dumbbell flyes |
| 4 | romanian deadlift, leg press, seated hamstrings curl, seated calf raises, dumbbell side delt raises |

### 5x/week
| Day | Exercises |
|---|---|
| 1 | dumbbell bench press, bent over row, machine shoulder press, reverse grip pull-down |
| 2 | barbell squat, back extension, split squats, leg press calf raises |
| 3 | seated dumbbell shoulder press, neutral grip pull-up, dumbbell incline press, seated cable row |
| 4 | romanian deadlift, leg press, seated hamstrings curl, seated calf raises |
| 5 | preacher curls, skullcrushers, dumbbell rear delt raises, barbell shrugs, dumbbell flyes, dumbbell side delt raises |

Each day has 3 free-form "Accessories" slots (user-managed, no auto-progression).

---

## Database schema (SQLite)

```sql
-- Singleton: one row, always id=1
CREATE TABLE profile (
  id              INTEGER PRIMARY KEY DEFAULT 1,
  frequency       INTEGER NOT NULL,         -- 3, 4, or 5
  current_day     INTEGER NOT NULL DEFAULT 1,
  current_week    INTEGER NOT NULL DEFAULT 1,
  created_at      TEXT NOT NULL
);

CREATE TABLE exercises (
  id              TEXT PRIMARY KEY,         -- slug, e.g. "dumbbell_bench_press"
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,
  is_bodyweight   INTEGER NOT NULL DEFAULT 0,  -- 0/1
  rounding        REAL NOT NULL DEFAULT 5,
  sort_order      INTEGER NOT NULL,
  -- progression params
  starting_sets          INTEGER NOT NULL DEFAULT 3,
  ending_sets            INTEGER NOT NULL DEFAULT 5,
  starting_reps          INTEGER,               -- NULL for bodyweight
  ending_reps            INTEGER,               -- NULL for bodyweight
  set_increase           INTEGER NOT NULL DEFAULT 1,
  reps_per_set_increase  INTEGER NOT NULL DEFAULT 2,
  weight_increase        REAL,                  -- NULL for bodyweight
  -- current progression state
  current_weight         REAL,                  -- NULL for bodyweight
  current_sets           INTEGER NOT NULL DEFAULT 3,
  current_reps           INTEGER,               -- NULL for bodyweight
  current_reps_per_set   INTEGER                -- NULL for weighted
);

-- Day assignments: which exercises appear on which day
CREATE TABLE day_assignments (
  exercise_id  TEXT NOT NULL REFERENCES exercises(id),
  day_number   INTEGER NOT NULL,
  position     INTEGER NOT NULL,            -- display order within the day
  PRIMARY KEY (exercise_id, day_number)
);

CREATE TABLE workout_sessions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  date        TEXT NOT NULL,               -- ISO date "2026-06-21"
  week_number INTEGER NOT NULL,
  day_number  INTEGER NOT NULL,
  logged_at   TEXT NOT NULL
);

CREATE TABLE workout_entries (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id        INTEGER NOT NULL REFERENCES workout_sessions(id),
  exercise_id       TEXT NOT NULL REFERENCES exercises(id),
  prescribed_weight REAL,
  prescribed_sets   INTEGER NOT NULL,
  prescribed_reps   INTEGER,
  completed         INTEGER NOT NULL,      -- 0/1
  notes             TEXT
);
```

---

## Project structure

```
ExercisePlanner/
├── PLAN.md
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── components.json              ← shadcn/ui config
│
├── src/
│   ├── app/                     ← Next.js App Router
│   │   ├── layout.tsx           ← root layout + nav
│   │   ├── page.tsx             ← redirect to /today or /setup
│   │   │
│   │   ├── setup/
│   │   │   └── page.tsx         ← multi-step setup wizard
│   │   │
│   │   ├── today/
│   │   │   └── page.tsx         ← today's workout + log form
│   │   │
│   │   ├── status/
│   │   │   └── page.tsx         ← all exercises + progression state
│   │   │
│   │   └── history/
│   │       └── page.tsx         ← past sessions list + detail
│   │
│   ├── actions/                 ← Next.js Server Actions (mutations)
│   │   ├── setup.ts             ← initProfile(), saveExercises()
│   │   ├── workout.ts           ← logWorkout(sessionData) → advances state
│   │   └── exercises.ts         ← updateExercise(), replaceExercise()
│   │
│   ├── db/
│   │   ├── client.ts            ← opens the SQLite connection (singleton)
│   │   ├── schema.sql           ← CREATE TABLE statements (run on first boot)
│   │   ├── queries/
│   │   │   ├── profile.ts       ← getProfile(), upsertProfile()
│   │   │   ├── exercises.ts     ← getExercises(), getExercisesForDay(), updateExerciseState()
│   │   │   ├── sessions.ts      ← getTodaySession(), getSessionHistory(), insertSession()
│   │   │   └── entries.ts       ← insertEntry(), getEntriesForSession()
│   │   └── seed.ts              ← inserts default exercises + splits on first run
│   │
│   ├── lib/
│   │   ├── progression.ts       ← pure functions: nextStateWeighted(), nextStateBodyweight(), roundToIncrement()
│   │   └── defaults.ts          ← default exercise list + split definitions
│   │
│   └── components/
│       ├── nav.tsx
│       ├── setup/
│       │   ├── FrequencyStep.tsx
│       │   ├── ExerciseListStep.tsx
│       │   └── StartingWeightsStep.tsx
│       ├── today/
│       │   ├── WorkoutCard.tsx   ← one card per exercise with completion toggle
│       │   └── LogForm.tsx
│       ├── status/
│       │   └── ExerciseStatusRow.tsx
│       └── history/
│           └── SessionCard.tsx
│
├── data/                        ← gitignored; SQLite db lives here at runtime
│   └── .gitkeep
│
└── tests/
    └── progression.test.ts      ← Vitest unit tests for progression.ts
```

---

## Pages in detail

### `/` (root)
Server component. Checks if `profile` table has a row. If not → redirect to `/setup`. If yes → redirect to `/today`.

### `/setup`
Multi-step client wizard (no page reloads between steps):
1. **Frequency** — radio: 3 / 4 / 5 days/week
2. **Exercises** — table of all 24 defaults; user can rename, toggle bodyweight, set rounding increment, swap for a different exercise
3. **Progression params** — accordion per exercise, pre-filled with defaults; most users skip this
4. **Starting weights** — for each weighted exercise: number input for weight; for bodyweight: number input for reps per set
5. **Confirm** — summary + "Start program" button → calls `initProfile()` server action, redirects to `/today`

### `/today`
Server component fetches: current week/day, exercises for today's day with their prescribed state. Renders a list of `WorkoutCard` components.

Each card shows:
- Exercise name + category
- **Weighted:** `[weight] lb — [sets] × [reps]`  e.g. `50 lb — 3 × 8`
- **Bodyweight:** `[sets] × [reps] reps`
- "Completed?" toggle (yes / no)
- Optional notes textarea

Submit button at the bottom calls `logWorkout()` server action:
1. Inserts a `workout_sessions` row
2. For each exercise: inserts a `workout_entries` row
3. Calls `nextState*()` to compute new state, writes it back to `exercises` table
4. Advances `current_day` (wraps at `frequency`); increments `current_week` on wrap
5. Revalidates the page

If today has already been logged, shows a read-only summary with an "Edit" option (re-opens the form with prior answers pre-filled).

### `/status`
Server component. Fetches all exercises with current state. Renders a table:

| Exercise | Current | Next step |
|---|---|---|
| dumbbell bench press | 50 lb · 3×8 | Complete 1 more → 4×8 |
| neutral grip pull-up | BW · 3×6 | Complete 1 more → 4×6 |
| barbell squat | 135 lb · 5×10 | Complete 1 more → 3×12 |
| machine shoulder press | 35 lb · 5×12 | Complete 1 more → +10% weight, reset to 3×8 |

### `/history`
Server component. Lists sessions newest-first; each row is collapsible to show per-exercise completion for that day.

---

## Progression module (`src/lib/progression.ts`)

```typescript
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
  weightIncrease: number;   // e.g. 0.10
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

export function nextStateWeighted(
  state: WeightedState,
  params: WeightedParams,
  completed: boolean,
): WeightedState { ... }

export function nextStateBodyweight(
  state: BodyweightState,
  params: BodyweightParams,
  completed: boolean,
): BodyweightState { ... }

export function roundToIncrement(value: number, increment: number): number {
  return Math.round(value / increment) * increment;
}

export function describeNextMilestone(
  exercise: Exercise,   // from DB, includes state + params
): string { ... }
```

All functions are pure (no I/O, no DB calls). Unit-tested with Vitest before wiring to the DB layer.

---

## Server Action flow (`logWorkout`)

```
User clicks "Submit" on /today
  → logWorkout(formData) [Server Action]
      → validate: all exercises have a completed value
      → db.insertSession({ date, week, day })
      → for each exercise:
          → db.insertEntry({ sessionId, exerciseId, prescribed*, completed, notes })
          → compute newState = nextState*(currentState, params, completed)
          → db.updateExerciseState(exerciseId, newState)
      → db.advanceCycle(profile)   ← increments current_day, wraps + increments week
      → revalidatePath('/today')
      → revalidatePath('/status')
      → redirect('/today')
```

---

## Data layer conventions (`src/db/`)

- `client.ts` exports a single `db` instance (module-level singleton, safe because Next.js server runs in one Node process)
- All query functions are typed: inputs and return types use `interface` definitions that mirror the DB schema
- Queries use prepared statements (`db.prepare(...)`) cached at module load time for performance
- DB file path: `process.env.DB_PATH ?? path.join(process.cwd(), 'data/exercise_planner.db')`
- Schema is applied via `db.exec(fs.readFileSync('src/db/schema.sql', 'utf8'))` on startup (idempotent with `CREATE TABLE IF NOT EXISTS`)

---

## Key edge cases

| Case | Handling |
|---|---|
| First run, no weights set | `/setup` step 4 requires all weights before submitting |
| Already logged today | `/today` shows read-only view; "Re-log" button re-opens form with prior answers |
| Skipped a day | User can manually pick any past unlogged day from a `/today?day=N&week=M` query param |
| Weight rounding float precision | `roundToIncrement` uses `Math.round(v / inc) * inc`; store as REAL, display with `toFixed(1)` |
| BW pull-ups with added weight | Treat as weighted; user enters bodyweight + plates as the weight |
| Rounding doesn't land on ending values | Validate in setup wizard: `(endingSets - startingSets) % setIncrease === 0` and same for reps |
| Replacing an exercise mid-program | `updateExercise()` warns that state will reset; user confirms |

---

## Implementation order

1. **`src/lib/progression.ts`** + **`tests/progression.test.ts`** — pure logic, fully tested first
2. **`src/db/schema.sql`** + **`src/db/client.ts`** + **`src/db/seed.ts`** — DB setup + default data
3. **`src/db/queries/*.ts`** — typed query wrappers
4. **`/setup` page** + **`actions/setup.ts`** — onboarding wizard, produces valid DB state
5. **`/today` page** + **`actions/workout.ts`** — core loop: view workout, log it, advance
6. **`/status` page** — read-only, just queries + display
7. **`/history` page** — read-only, just queries + display
8. Nav, root redirect, polish

---

## Non-goals

- Auth / multi-user support
- The 21-week SBS Strength / Hypertrophy / RTF programs
- Mobile app (though the Tailwind layout should be responsive enough to use on phone)
- Cloud sync or export
