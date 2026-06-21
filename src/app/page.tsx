import { redirect } from 'next/navigation';
import { getProfile } from '@/db/queries/profile';

export default function RootPage() {
  const profile = getProfile();
  if (!profile) {
    redirect('/setup');
  }
  redirect('/today');
}
