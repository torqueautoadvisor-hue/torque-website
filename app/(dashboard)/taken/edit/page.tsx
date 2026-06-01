import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../lib/db';
import TakenEditForm from './TakenEditForm';

export default async function TakenEditPage({
  searchParams,
}: {
  searchParams: Promise<{ tkn_id?: string }>;
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

  const params = await searchParams;
  const tknIdStr = params.tkn_id;
  if (!tknIdStr) {
    redirect('/taken');
  }

  const tknId = parseInt(tknIdStr);
  if (isNaN(tknId)) {
    redirect('/taken');
  }

  let record: any = null;
  let staffList: any[] = [];
  let statusList: any[] = [];
  let rejectionReasons: any[] = [];

  try {
    // 1. Fetch Taken Record
    const recordRes = await db.query(
      'SELECT * FROM taken_detail WHERE tkn_id = $1 AND tkn_status != 3',
      [tknId]
    );

    if (recordRes.rowCount === 0) {
      redirect('/taken');
    }

    record = recordRes.rows[0];

    // Branch confinement validation
    if (record.branch_id !== branchId) {
      redirect('/taken');
    }

    // Role-based boundary validation (Non-admins can only view/edit their own assigned Taken records)
    if (!isAdmin && record.tkn_adm_id !== adminId) {
      redirect('/taken');
    }

    // 2. Fetch staff list in branch
    const staffRes = await db.query(
      'SELECT adm_id, adm_username FROM admin_login WHERE adm_status = 1 AND adm_id != 1 AND branch_id = $1 ORDER BY adm_username',
      [branchId]
    );
    staffList = staffRes.rows;

    // 3. Fetch active status list
    const statusRes = await db.query('SELECT status_id, status_name FROM status_detail WHERE status_id != 3');
    statusList = statusRes.rows;

    // 4. Fetch active rejection reasons
    const rejRes = await db.query('SELECT rej_res_id, rej_res_name FROM rej_res_detail WHERE rej_res_status = 1');
    rejectionReasons = rejRes.rows;

  } catch (err: any) {
    console.error('Failed to load edit taken record:', err.message);
    redirect('/taken');
  }

  return (
    <TakenEditForm
      record={record}
      staffList={staffList}
      statusList={statusList}
      rejectionReasons={rejectionReasons}
      branchId={branchId}
      isAdmin={isAdmin}
    />
  );
}
