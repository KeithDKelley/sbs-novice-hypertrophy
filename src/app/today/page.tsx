import { getProfile } from '@/db/queries/profile';
import { getExercisesForDay, getRunExercises } from '@/db/queries/exercises';
import { getWeekSessions } from '@/db/queries/sessions';
import { getEntriesForSession } from '@/db/queries/entries';
import { getCardioLogsForWeek } from '@/db/queries/cardio';
import { WeekView } from '@/components/today/WeekView';
import { redirect } from 'next/navigation';
import type { Exercise } from '@/lib/progression';
import type { WorkoutSession } from '@/db/queries/sessions';
import type { WorkoutEntry } from '@/db/queries/entries';
import type { CardioLog } from '@/db/queries/cardio';

export default function TodayPage() {
  const profile = getProfile();
  if (!profile) redirect('/setup');

  const { frequency, current_day, current_week } = profile;

  // Exercises for each lifting day
  const exercisesByDay: Record<number, Exercise[]> = {};
  for (let day = 1; day <= frequency; day++) {
    exercisesByDay[day] = getExercisesForDay(day);
  }

  // Sessions logged this week, keyed by day_number
  const weekSessions = getWeekSessions(current_week);
  const sessionsByDay: Record<
    number,
    WorkoutSession & { entries: (WorkoutEntry & { exercise_name: string })[] }
  > = {};
  for (const session of weekSessions) {
    sessionsByDay[session.day_number] = {
      ...session,
      entries: getEntriesForSession(session.id),
    };
  }

  // Run exercises and this week's cardio log
  const runExercises = getRunExercises();
  const cardioLogs = getCardioLogsForWeek(current_week);
  const cardioThisWeek: Record<string, CardioLog> = {};
  for (const log of cardioLogs) {
    cardioThisWeek[log.exercise_id] = log;
  }

  const daysDone = weekSessions.length;
  const nextUp = sessionsByDay[current_day]
    ? 'All done for today'
    : `Day ${current_day} up next`;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">Week {current_week}</h1>
        <p className="text-sm text-muted-foreground">
          {daysDone}/{frequency} days done · {nextUp}
        </p>
      </div>

      <WeekView
        frequency={frequency}
        currentDay={current_day}
        currentWeek={current_week}
        exercisesByDay={exercisesByDay}
        sessionsByDay={sessionsByDay}
        runExercises={runExercises}
        cardioThisWeek={cardioThisWeek}
      />
    </div>
  );
}
