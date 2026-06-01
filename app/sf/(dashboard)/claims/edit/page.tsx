import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../../lib/db';
import ClaimEditForm from './ClaimEditForm';

export default async function ClaimEditPage({
  searchParams,
}: {
  searchParams: Promise<{ clm_id?: string }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    redirect('/sf');
  }

  const user = JSON.parse(session);
  const branchId = user.branch_id || 1;
  const adminId = user.adm_id;
  const isAdmin = user.adm_type === 0;

  const params = await searchParams;
  const clmIdStr = params.clm_id;
  if (!clmIdStr) {
    redirect('/sf/claims');
  }

  const clmId = parseInt(clmIdStr);
  if (isNaN(clmId)) {
    redirect('/sf/claims');
  }

  let record: any = null;
  let staffList: any[] = [];
  let statusList: any[] = [];

  try {
    // 1. Fetch Claim Record
    const recordRes = await db.query(
      'SELECT * FROM claim_detail WHERE clm_id = $1 AND clm_status != 3',
      [clmId]
    );

    if (recordRes.rowCount === 0) {
      redirect('/sf/claims');
    }

    record = recordRes.rows[0];

    // Branch confinement validation
    if (record.branch_id !== branchId) {
      redirect('/sf/claims');
    }

    // Role-based confinement: non-admins can only load their own assigned claims
    if (!isAdmin && record.clm_adm_id !== adminId) {
      redirect('/sf/claims');
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

  } catch (err: any) {
    console.error('Failed to load edit claim record:', err.message);
    redirect('/sf/claims');
  }

  return (
    <ClaimEditForm
      record={record}
      staffList={staffList}
      statusList={statusList}
      branchId={branchId}
      isAdmin={isAdmin}
    />
  );
}
