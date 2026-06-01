import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../../lib/db';
import GlobalAddForm from './GlobalAddForm';

export default async function GlobalAddPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    redirect('/sf');
  }

  const user = JSON.parse(session);
  const branchId = user.branch_id || 1;

  // Check permissions (Module ID 3 check)
  const permissions = user.md_id ? user.md_id.split(',') : [];
  if (user.adm_type !== 0 && !permissions.includes('3')) {
    redirect('/sf/insurance');
  }

  let nextGlbCode = 'GLB1';
  let staffList: any[] = [];
  let reasonsList: any[] = [];
  let statusList: any[] = [];

  try {
    // 1. Fetch Staff Sub-Admins list
    const staffRes = await db.query(
      'SELECT adm_id, adm_username FROM admin_login WHERE adm_status = 1 AND adm_id != 1 AND branch_id = $1 ORDER BY adm_username',
      [branchId]
    );
    staffList = staffRes.rows;

    // 2. Fetch Reasons
    const reasonsRes = await db.query(
      'SELECT rej_res_id, rej_res_name FROM rej_res_detail WHERE rej_res_status = 1 ORDER BY rej_res_name'
    );
    reasonsList = reasonsRes.rows;

    // 3. Fetch Statuses
    const statusRes = await db.query(
      'SELECT status_id, status_name FROM status_detail WHERE status_id != 3 ORDER BY status_id'
    );
    statusList = statusRes.rows;

    // 4. Calculate next GLB code
    const countRes = await db.query(
      "SELECT COUNT(*) as count FROM global_detail WHERE glb_code_no LIKE 'GLB%'"
    );
    const totalCount = parseInt(countRes.rows[0].count);
    nextGlbCode = `GLB${totalCount + 1}`;
  } catch (err: any) {
    console.error('Failed to load global add parameters:', err.message);
  }

  return (
    <GlobalAddForm
      nextGlbCode={nextGlbCode}
      staffList={staffList}
      reasonsList={reasonsList}
      statusList={statusList}
    />
  );
}
