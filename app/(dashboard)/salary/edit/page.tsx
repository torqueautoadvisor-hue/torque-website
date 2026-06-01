import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../lib/db';
import SalaryEditForm from './SalaryEditForm';

export default async function SalaryEditPage({
  searchParams,
}: {
  searchParams: Promise<{ slr_id?: string }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    redirect('/');
  }

  const user = JSON.parse(session);
  const branchId = user.branch_id || 1;
  const isAdmin = user.adm_type === 0;

  const params = await searchParams;
  const slrIdStr = params.slr_id;
  if (!slrIdStr) {
    redirect('/salary');
  }

  const slrId = parseInt(slrIdStr);
  if (isNaN(slrId)) {
    redirect('/salary');
  }

  let record: any = null;
  let staffList: any[] = [];

  try {
    const recordRes = await db.query(
      'SELECT * FROM salary_detail WHERE slr_id = $1 AND slr_status != 3',
      [slrId]
    );

    if (recordRes.rowCount === 0) {
      redirect('/salary');
    }

    record = recordRes.rows[0];

    // Branch confinement validation
    if (record.branch_id !== branchId) {
      redirect('/salary');
    }

    const staffRes = await db.query(
      'SELECT adm_id, adm_username FROM admin_login WHERE adm_status = 1 AND adm_id != 1 AND branch_id = $1 ORDER BY adm_username',
      [branchId]
    );
    staffList = staffRes.rows;

  } catch (err: any) {
    console.error('Failed to load edit salary record:', err.message);
    redirect('/salary');
  }

  return (
    <SalaryEditForm
      record={record}
      staffList={staffList}
      branchId={branchId}
      isAdmin={isAdmin}
    />
  );
}
