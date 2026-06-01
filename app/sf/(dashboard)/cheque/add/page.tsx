import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ChequeAddForm from './ChequeAddForm';

export default async function ChequeAddPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    redirect('/sf');
  }

  const user = JSON.parse(session);
  const branchId = user.branch_id || 1;
  const isAdmin = user.adm_type === 0;

  return (
    <ChequeAddForm
      branchId={branchId}
      isAdmin={isAdmin}
    />
  );
}
