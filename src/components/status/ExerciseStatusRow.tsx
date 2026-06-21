import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { describeNextMilestone } from '@/lib/progression';
import type { Exercise } from '@/lib/progression';

interface ExerciseStatusRowProps {
  exercise: Exercise;
}

export function ExerciseStatusRow({ exercise }: ExerciseStatusRowProps) {
  const current = exercise.is_bodyweight
    ? `BW · ${exercise.current_sets}×${exercise.current_reps_per_set ?? 5}`
    : `${(exercise.current_weight ?? 0).toFixed(1)} lb · ${exercise.current_sets}×${exercise.current_reps ?? exercise.starting_reps}`;

  const nextMilestone = describeNextMilestone(exercise);

  return (
    <TableRow>
      <TableCell>
        <div>
          <p className="font-medium capitalize">{exercise.name}</p>
          <p className="text-xs text-muted-foreground">{exercise.category}</p>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="font-mono">
          {current}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{nextMilestone}</TableCell>
    </TableRow>
  );
}
