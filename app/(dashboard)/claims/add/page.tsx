import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../lib/db';
import ClaimAddForm from './ClaimAddForm';

export default async function ClaimAddPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    redirect('/');
  }

  const user = JSON.parse(session);
  const branchId = user.branch_id || 1;
  const isAdmin = user.adm_type === 0;

  let staffList: any[] = [];
  let clmCodeNo = 'CLAIM1';

  try {
    // 1. Fetch Staff Sub-Admins in branch
    const staffRes = await db.query(
      'SELECT adm_id, adm_username FROM admin_login WHERE adm_status = 1 AND adm_id != 1 AND branch_id = $1 ORDER BY adm_username',
      [branchId]
    );
    staffList = staffRes.rows;

    // 2. Pre-calculate sequential Claims Code (e.g. CLAIM34)
    const countRes = await db.query(
      "SELECT COUNT(*) as count FROM claim_detail WHERE clm_code_no LIKE 'CLAIM%'"
    );
    const totalCount = parseInt(countRes.rows[0].count) || 0;
    clmCodeNo = `CLAIM${totalCount + 1}`;

  } catch (err: any) {
    console.error('Failed to load add claim metadata:', err.message);
  }

  return (
    <ClaimAddForm
      clmCodeNo={clmCodeNo}
      staffList={staffList}
      branchId={branchId}
      isAdmin={isAdmin}
    />
  );
}
