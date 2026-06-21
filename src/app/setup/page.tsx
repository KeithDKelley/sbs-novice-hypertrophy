import { SetupWizard } from '@/components/setup/SetupWizard';
import { DEFAULT_EXERCISES } from '@/lib/defaults';

export default function SetupPage() {
  return <SetupWizard defaultExercises={DEFAULT_EXERCISES} />;
}
