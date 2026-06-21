'use client';

import type { ReactNode } from 'react';
import { LogForm } from './LogForm';
import { CardioCard } from './CardioCard';
import type { Exercise, RunExercise } from '@/lib/progression';
import type { WorkoutSession } from '@/db/queries/sessions';
import type { WorkoutEntry } from '@/db/queries/entries';
import type { CardioLog } from '@/db/queries/cardio';

interface SessionWithEntries extends WorkoutSession {
  entries: (WorkoutEntry & { exercise_name: string })[];
}

interface WeekViewProps {
  frequency: number;
  currentDay: number;
  currentWeek: number;
  exercisesByDay: Record<number, Exercise[]>;
  sessionsByDay: Record<number, SessionWithEntries>;
  runExercises: RunExercise[];
  cardioThisWeek: Record<string, CardioLog>;
}

// Fixed interleave: one run after each of the first 3 lifting days.
const RUN_ORDER = ['run_long_distance', 'run_speed', 'run_outdoor'] as const;

type WeekItem = { kind: 'day'; day: number } | { kind: 'run'; runId: string };

function buildSequence(frequency: number): WeekItem[] {
  const items: WeekItem[] = [];
  for (let day = 1; day <= frequency; day++) {
    items.push({ kind: 'day', day });
    const runId = RUN_ORDER[day - 1];
    if (runId) items.push({ kind: 'run', runId });
  }
  return items;
}

export function WeekView({
  frequency,
  currentDay,
  exercisesByDay,
  sessionsByDay,
  runExercises,
  cardioThisWeek,
}: WeekViewProps) {
  const sequence = buildSequence(frequency);
  const runById = Object.fromEntries(runExercises.map((r) => [r.id, r]));

  const isDone = (item: WeekItem) =>
    item.kind === 'day' ? !!sessionsByDay[item.day] : !!cardioThisWeek[item.runId];

  // Incomplete items keep their interleaved order; completed items go to the
  // bottom in their original sequence order.
  const incomplete = sequence.filter((item) => !isDone(item));
  const completed = sequence.filter((item) => isDone(item));

  const renderItem = (item: WeekItem) => {
    if (item.kind === 'run') {
      const run = runById[item.runId];
      if (!run) return null;
      const done = !!cardioThisWeek[run.id];
      return (
        <SectionCard key={run.id} title={run.name} status={done ? 'done' : 'upcoming'}>
          <CardioCard run={run} existingLog={cardioThisWeek[run.id]} />
        </SectionCard>
      );
    }

    const { day } = item;
    const session = sessionsByDay[day];
    const done = !!session;
    const isToday = day === currentDay && !done;
    const exercises = exercisesByDay[day] ?? [];
    const status = done ? 'done' : isToday ? 'today' : 'upcoming';

    return (
      <SectionCard key={`day-${day}`} title={`Day ${day}`} status={status}>
        {exercises.length === 0 ? (
          <p className="text-sm text-muted-foreground py-1">No exercises assigned.</p>
        ) : session ? (
          <LogForm exercises={exercises} existingSession={{ entries: session.entries }} />
        ) : isToday ? (
          <LogForm exercises={exercises} />
        ) : (
          <UpcomingList exercises={exercises} />
        )}
      </SectionCard>
    );
  };

  return (
    <div className="space-y-3">
      {incomplete.map(renderItem)}
      {completed.length > 0 && (
        <>
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 border-t border-border/40" />
            <span className="text-xs text-muted-foreground">Completed</span>
            <div className="flex-1 border-t border-border/40" />
          </div>
          {completed.map(renderItem)}
        </>
      )}
    </div>
  );
}

// ── Section card ────────────────────────────────────────────────────────────

type Status = 'today' | 'upcoming' | 'done';

function SectionCard({
  title,
  status,
  children,
}: {
  title: string;
  status: Status;
  children: ReactNode;
}) {
  const dim = status === 'done';

  const badge =
    status === 'today' ? (
      <span className="text-xs px-2 py-0.5 rounded-full border border-primary/40 bg-primary/10 text-primary">
        Today
      </span>
    ) : status === 'done' ? (
      <span className="text-xs text-muted-foreground">✓</span>
    ) : null;

  return (
    <div
      className={`rounded-lg border transition-opacity ${
        dim ? 'border-border/30 opacity-50' : 'border-border'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/40">
        <span className={`text-sm font-semibold ${dim ? 'text-muted-foreground' : ''}`}>
          {title}
        </span>
        {badge}
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

// ── Upcoming exercise list ──────────────────────────────────────────────────

function UpcomingList({ exercises }: { exercises: Exercise[] }) {
  return (
    <div className="space-y-1">
      {exercises.map((ex) => {
        const prescription = ex.is_bodyweight
          ? `BW · ${ex.current_sets}×${ex.current_reps_per_set ?? 5}`
          : `${(ex.current_weight ?? 0).toFixed(1)} lb · ${ex.current_sets}×${
              ex.current_reps ?? ex.starting_reps
            }`;
        return (
          <div
            key={ex.id}
            className="flex items-center gap-2 px-3 py-2 rounded-md border border-border/40 text-sm text-muted-foreground"
          >
            <span className="flex-1 capitalize">{ex.name}</span>
            <span className="font-mono text-xs">{prescription}</span>
          </div>
        );
      })}
    </div>
  );
}
