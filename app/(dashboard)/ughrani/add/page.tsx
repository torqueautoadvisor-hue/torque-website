import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import UghraniAddForm from './UghraniAddForm';

export default async function UghraniAddPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    redirect('/');
  }

  const user = JSON.parse(session);
  const branchId = user.branch_id || 1;
  const isAdmin = user.adm_type === 0;

  return (
    <UghraniAddForm
      branchId={branchId}
      isAdmin={isAdmin}
    />
  );
}
