import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import FitperAddForm from './FitperAddForm';

export default async function FitperAddPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    redirect('/sf');
  }

  const user = JSON.parse(session);
  const branchId = user.branch_id || 1;
  const isAdmin = user.adm_type === 0;

  return (
    <FitperAddForm
      branchId={branchId}
      isAdmin={isAdmin}
    />
  );
}
