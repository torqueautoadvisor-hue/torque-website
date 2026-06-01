import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../lib/db';
import GlobalEditForm from './GlobalEditForm';

export default async function GlobalEditPage({
  searchParams,
}: {
  searchParams: Promise<{
    glb_id?: string;
  }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    redirect('/');
  }

  const user = JSON.parse(session);
  const branchId = user.branch_id || 1;
  const adminId = user.adm_id;
  const isAdmin = user.adm_type === 0;

  // Check permissions (Module ID 3 check)
  const permissions = user.md_id ? user.md_id.split(',') : [];
  if (user.adm_type !== 0 && !permissions.includes('3')) {
    redirect('/insurance');
  }

  const params = await searchParams;
  const glbIdStr = params.glb_id;
  if (!glbIdStr) {
    redirect('/global');
  }

  const glbId = parseInt(glbIdStr);
  if (isNaN(glbId)) {
    redirect('/global');
  }

  let record: any = null;
  let staffList: any[] = [];
  let reasonsList: any[] = [];
  let statusList: any[] = [];

  try {
    // 1. Fetch the existing record
    // Ensure strict role boundaries: sub-admins can only load their own assigned records
    let recordQuery = `SELECT * FROM global_detail WHERE glb_id = $1 AND branch_id = $2 AND glb_status != 3`;
    const queryParams: any[] = [glbId, branchId];

    if (!isAdmin) {
      queryParams.push(adminId);
      recordQuery += ` AND glb_adm_id = $3`;
    }

    const recordRes = await db.query(recordQuery, queryParams);
    if (recordRes.rows.length === 0) {
      redirect('/global');
    }
    record = recordRes.rows[0];

    // 2. Fetch Staff Sub-Admins list
    const staffRes = await db.query(
      'SELECT adm_id, adm_username FROM admin_login WHERE adm_status = 1 AND adm_id != 1 AND branch_id = $1 ORDER BY adm_username',
      [branchId]
    );
    staffList = staffRes.rows;

    // 3. Fetch Reasons
    const reasonsRes = await db.query(
      'SELECT rej_res_id, rej_res_name FROM rej_res_detail WHERE rej_res_status = 1 ORDER BY rej_res_name'
    );
    reasonsList = reasonsRes.rows;

    // 4. Fetch Statuses
    const statusRes = await db.query(
      'SELECT status_id, status_name FROM status_detail WHERE status_id != 3 ORDER BY status_id'
    );
    statusList = statusRes.rows;

  } catch (err: any) {
    console.error('Failed to load global edit page:', err.message);
    redirect('/global');
  }

  return (
    <GlobalEditForm
      record={record}
      staffList={staffList}
      reasonsList={reasonsList}
      statusList={statusList}
    />
  );
}
