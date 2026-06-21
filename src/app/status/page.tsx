import { getProfile } from '@/db/queries/profile';
import { getAllExercises } from '@/db/queries/exercises';
import { redirect } from 'next/navigation';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExerciseStatusRow } from '@/components/status/ExerciseStatusRow';

export default function StatusPage() {
  const profile = getProfile();

  if (!profile) {
    redirect('/setup');
  }

  const exercises = getAllExercises();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Exercise Status</h1>
        <p className="text-muted-foreground mt-1">
          Current progression state for all exercises.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Exercise</TableHead>
            <TableHead>Current</TableHead>
            <TableHead>Next Step</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exercises.map((exercise) => (
            <ExerciseStatusRow key={exercise.id} exercise={exercise} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
