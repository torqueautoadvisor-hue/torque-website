import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../lib/db';
import LicenseAddForm from './LicenseAddForm';

export default async function LicenseAddPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    redirect('/');
  }

  const user = JSON.parse(session);
  const branchId = user.branch_id || 1;
  const isAdmin = user.adm_type === 0;

  let staffList: any[] = [];
  let penResList: any[] = [];

  try {
    // 1. Fetch Staff Sub-Admins
    const staffRes = await db.query(
      'SELECT adm_id, adm_username FROM admin_login WHERE adm_status = 1 AND adm_id != 1 AND branch_id = $1 ORDER BY adm_username',
      [branchId]
    );
    staffList = staffRes.rows;

    // 2. Fetch pending reasons pen_res_detail
    const penResRes = await db.query(
      'SELECT pen_res_id, pen_res_name FROM pen_res_detail WHERE pen_res_status = 1 ORDER BY pen_res_name'
    );
    penResList = penResRes.rows;

  } catch (err: any) {
    console.error('Failed to load add license metadata:', err.message);
  }

  return (
    <LicenseAddForm
      staffList={staffList}
      penResList={penResList}
      branchId={branchId}
      isAdmin={isAdmin}
    />
  );
}
