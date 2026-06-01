import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../../lib/db';
import LicenseEditForm from './LicenseEditForm';

export default async function LicenseEditPage({
  searchParams,
}: {
  searchParams: Promise<{ rto_id?: string }>;
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
  const rtoIdStr = params.rto_id;
  if (!rtoIdStr) {
    redirect('/sf/license');
  }

  const rtoId = parseInt(rtoIdStr);
  if (isNaN(rtoId)) {
    redirect('/sf/license');
  }

  let record: any = null;
  let staffList: any[] = [];
  let penResList: any[] = [];

  try {
    // 1. Fetch RTO Record (service_id = 1)
    const recordRes = await db.query(
      'SELECT * FROM rto_detail WHERE rto_id = $1 AND service_id = 1 AND rto_status != 3',
      [rtoId]
    );

    if (recordRes.rowCount === 0) {
      redirect('/sf/license');
    }

    record = recordRes.rows[0];

    // Branch confinement validation
    if (record.branch_id !== branchId) {
      redirect('/sf/license');
    }

    // Role-based boundary validation (Non-admins can only view/edit their assigned records)
    if (!isAdmin && record.rto_adm_id !== adminId) {
      redirect('/sf/license');
    }

    // 2. Fetch staff list in branch
    const staffRes = await db.query(
      'SELECT adm_id, adm_username FROM admin_login WHERE adm_status = 1 AND adm_id != 1 AND branch_id = $1 ORDER BY adm_username',
      [branchId]
    );
    staffList = staffRes.rows;

    // 3. Fetch pending reasons pen_res_detail
    const penResRes = await db.query(
      'SELECT pen_res_id, pen_res_name FROM pen_res_detail WHERE pen_res_status = 1 ORDER BY pen_res_name'
    );
    penResList = penResRes.rows;

  } catch (err: any) {
    console.error('Failed to load edit license record:', err.message);
    redirect('/sf/license');
  }

  return (
    <LicenseEditForm
      record={record}
      staffList={staffList}
      penResList={penResList}
      branchId={branchId}
      isAdmin={isAdmin}
    />
  );
}
