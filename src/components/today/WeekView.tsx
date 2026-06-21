'use client';

import { useState } from 'react';
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

type Tab = number | 'cardio';

export function WeekView({
  frequency,
  currentDay,
  exercisesByDay,
  sessionsByDay,
  runExercises,
  cardioThisWeek,
}: WeekViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>(currentDay);

  const days = Array.from({ length: frequency }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      {/* Tab strip */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {days.map((day) => {
          const isDone = !!sessionsByDay[day];
          const isToday = day === currentDay && !isDone;
          const isActive = activeTab === day;
          return (
            <button
              key={day}
              onClick={() => setActiveTab(day)}
              className={[
                'flex-1 min-w-[64px] px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : isDone
                  ? 'bg-muted text-muted-foreground'
                  : isToday
                  ? 'border border-primary text-primary'
                  : 'border border-border text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              Day {day}
              {isDone && <span className="ml-1 opacity-70">✓</span>}
              {isToday && <span className="ml-1">·</span>}
            </button>
          );
        })}
        <button
          onClick={() => setActiveTab('cardio')}
          className={[
            'flex-1 min-w-[64px] px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap',
            activeTab === 'cardio'
              ? 'bg-primary text-primary-foreground'
              : 'border border-border text-muted-foreground hover:text-foreground',
          ].join(' ')}
        >
          Cardio
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'cardio' ? (
        <CardioSection runExercises={runExercises} cardioThisWeek={cardioThisWeek} />
      ) : (
        <DayPanel
          day={activeTab as number}
          currentDay={currentDay}
          exercises={exercisesByDay[activeTab as number] ?? []}
          session={sessionsByDay[activeTab as number]}
        />
      )}
    </div>
  );
}

// ── Day panel ──────────────────────────────────────────────────────────────

interface DayPanelProps {
  day: number;
  currentDay: number;
  exercises: Exercise[];
  session?: SessionWithEntries;
}

function DayPanel({ day, currentDay, exercises, session }: DayPanelProps) {
  if (exercises.length === 0) {
    return (
      <p className="text-center py-10 text-muted-foreground text-sm">
        No exercises assigned for Day {day}.
      </p>
    );
  }

  // Completed day or today-already-logged → LogForm in read-only mode
  if (session) {
    return (
      <LogForm
        exercises={exercises}
        existingSession={{ entries: session.entries }}
      />
    );
  }

  // Today (interactive)
  if (day === currentDay) {
    return <LogForm exercises={exercises} />;
  }

  // Upcoming day — read-only prescription list
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground mb-2 px-1">
        Upcoming · Day {day}
      </p>
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

// ── Cardio section ─────────────────────────────────────────────────────────

interface CardioSectionProps {
  runExercises: RunExercise[];
  cardioThisWeek: Record<string, CardioLog>;
}

function CardioSection({ runExercises, cardioThisWeek }: CardioSectionProps) {
  const doneCount = runExercises.filter((r) => cardioThisWeek[r.id]).length;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground px-1">
        This week · {doneCount}/{runExercises.length} logged
      </p>
      {runExercises.map((run) => (
        <CardioCard key={run.id} run={run} existingLog={cardioThisWeek[run.id]} />
      ))}
    </div>
  );
}
