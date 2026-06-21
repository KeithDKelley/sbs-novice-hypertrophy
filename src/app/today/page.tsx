import { getProfile } from '@/db/queries/profile';
import { getExercisesForDay } from '@/db/queries/exercises';
import { getTodaySession } from '@/db/queries/sessions';
import { getEntriesForSession } from '@/db/queries/entries';
import { LogForm } from '@/components/today/LogForm';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

export default function TodayPage() {
  const profile = getProfile();

  if (!profile) {
    redirect('/setup');
  }

  const exercises = getExercisesForDay(profile.current_day);
  const existingSession = getTodaySession(profile.current_day, profile.current_week);
  const existingEntries = existingSession
    ? getEntriesForSession(existingSession.id)
    : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {existingSession ? "Today's Workout (Logged)" : "Today's Workout"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Week {profile.current_week} · Day {profile.current_day}
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {exercises.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No exercises assigned for day {profile.current_day}.</p>
          <p className="text-sm mt-1">Check your setup configuration.</p>
        </div>
      ) : (
        <LogForm
          exercises={exercises}
          existingSession={
            existingSession && existingEntries
              ? { entries: existingEntries }
              : undefined
          }
        />
      )}
    </div>
  );
}
