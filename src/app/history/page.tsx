import { getProfile } from '@/db/queries/profile';
import { getAllSessions } from '@/db/queries/sessions';
import { getEntriesForSession } from '@/db/queries/entries';
import { redirect } from 'next/navigation';
import { SessionCard } from '@/components/history/SessionCard';

export default function HistoryPage() {
  const profile = getProfile();

  if (!profile) {
    redirect('/setup');
  }

  const sessions = getAllSessions();
  const sessionsWithEntries = sessions.map((session) => ({
    session,
    entries: getEntriesForSession(session.id),
  }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Workout History</h1>
        <p className="text-muted-foreground mt-1">
          {sessions.length} session{sessions.length !== 1 ? 's' : ''} logged so far.
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No workouts logged yet.</p>
          <p className="text-sm mt-1">Complete your first workout on the Today page.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessionsWithEntries.map(({ session, entries }) => (
            <SessionCard key={session.id} session={session} entries={entries} />
          ))}
        </div>
      )}
    </div>
  );
}
