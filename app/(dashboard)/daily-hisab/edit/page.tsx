import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../lib/db';
import HisabEditForm from './HisabEditForm';

export default async function DailyHisabEditPage({
  searchParams,
}: {
  searchParams: Promise<{
    dl_hsb_id?: string;
  }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    redirect('/');
  }

  const user = JSON.parse(session);
  const branchId = user.branch_id || 1;
  const isAdmin = user.adm_type === 0;

  // Check permissions (Module ID 9 check)
  const permissions = user.md_id ? user.md_id.split(',') : [];
  if (user.adm_type !== 0 && !permissions.includes('9')) {
    redirect('/insurance');
  }

  const params = await searchParams;
  const hisabIdStr = params.dl_hsb_id;
  if (!hisabIdStr) {
    redirect('/daily-hisab');
  }

  const hisabId = parseInt(hisabIdStr);
  if (isNaN(hisabId)) {
    redirect('/daily-hisab');
  }

  let record: any = null;
  let paymentMethods: any[] = [];
  let statusList: any[] = [];

  try {
    // 1. Fetch active hisab record
    let query = 'SELECT * FROM daily_hisab_detail WHERE dl_hsb_id = $1 AND branch_id = $2 AND dl_hsb_status != 3';
    const queryParams: any[] = [hisabId, branchId];

    if (!isAdmin) {
      queryParams.push(user.adm_id);
      query += ` AND dl_hsb_adm_id = $3`;
    }

    const recRes = await db.query(query, queryParams);
    if (recRes.rows.length === 0) {
      redirect('/daily-hisab');
    }
    record = recRes.rows[0];

    // 2. Fetch payment methods
    const pmRes = await db.query(
      'SELECT pm_id, pm_name FROM pay_method_detail WHERE pm_status = 1 ORDER BY pm_id'
    );
    paymentMethods = pmRes.rows;

    // 3. Fetch statuses
    const statusRes = await db.query(
      'SELECT status_id, status_name FROM status_detail WHERE status_id IN (1, 2) ORDER BY status_id'
    );
    statusList = statusRes.rows;

  } catch (err: any) {
    console.error('Failed to load daily hisab edit parameters:', err.message);
    redirect('/daily-hisab');
  }

  return (
    <HisabEditForm
      record={record}
      paymentMethods={paymentMethods}
      statusList={statusList}
    />
  );
}
