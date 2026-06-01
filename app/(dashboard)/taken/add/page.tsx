import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../lib/db';
import TakenAddForm from './TakenAddForm';

export default async function TakenAddPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    redirect('/');
  }

  const user = JSON.parse(session);
  const branchId = user.branch_id || 1;
  const isAdmin = user.adm_type === 0;

  let staffList: any[] = [];
  let statusList: any[] = [];
  let rejectionReasons: any[] = [];
  let nextCode = 'TKN1';

  try {
    // 1. Fetch active staff list in this branch
    const staffRes = await db.query(
      'SELECT adm_id, adm_username FROM admin_login WHERE adm_status = 1 AND adm_id != 1 AND branch_id = $1 ORDER BY adm_username',
      [branchId]
    );
    staffList = staffRes.rows;

    // 2. Fetch active status list
    const statusRes = await db.query('SELECT status_id, status_name FROM status_detail WHERE status_id != 3');
    statusList = statusRes.rows;

    // 3. Fetch active rejection reasons
    const rejRes = await db.query('SELECT rej_res_id, rej_res_name FROM rej_res_detail WHERE rej_res_status = 1');
    rejectionReasons = rejRes.rows;

    // 4. Pre-calculate sequential Taken Code
    const countRes = await db.query("SELECT COUNT(*) as count FROM taken_detail WHERE tkn_code_no LIKE 'TKN%'");
    const totalCount = parseInt(countRes.rows[0].count);
    nextCode = `TKN${totalCount + 1}`;

  } catch (err: any) {
    console.error('Failed to load add taken form metadata:', err.message);
  }

  return (
    <TakenAddForm
      nextCode={nextCode}
      staffList={staffList}
      statusList={statusList}
      rejectionReasons={rejectionReasons}
      branchId={branchId}
      isAdmin={isAdmin}
    />
  );
}
