import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../../lib/db';
import SalaryAddForm from './SalaryAddForm';

export default async function SalaryAddPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    redirect('/sf');
  }

  const user = JSON.parse(session);
  const branchId = user.branch_id || 1;
  const isAdmin = user.adm_type === 0;

  let staffList: any[] = [];

  try {
    const staffRes = await db.query(
      'SELECT adm_id, adm_username FROM admin_login WHERE adm_status = 1 AND adm_id != 1 AND branch_id = $1 ORDER BY adm_username',
      [branchId]
    );
    staffList = staffRes.rows;
  } catch (err: any) {
    console.error('Failed to load add salary metadata:', err.message);
  }

  return (
    <SalaryAddForm
      staffList={staffList}
      branchId={branchId}
      isAdmin={isAdmin}
    />
  );
}
