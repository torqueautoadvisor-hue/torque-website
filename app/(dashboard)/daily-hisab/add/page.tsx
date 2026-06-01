import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../lib/db';
import HisabAddForm from './HisabAddForm';

export default async function DailyHisabAddPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    redirect('/');
  }

  const user = JSON.parse(session);

  // Check permissions (Module ID 9 check)
  const permissions = user.md_id ? user.md_id.split(',') : [];
  if (user.adm_type !== 0 && !permissions.includes('9')) {
    redirect('/insurance');
  }

  let paymentMethods: any[] = [];
  let statusList: any[] = [];
  let nextHisabCode = 'DH1';

  try {
    // 1. Fetch active payment methods
    const pmRes = await db.query(
      'SELECT pm_id, pm_name FROM pay_method_detail WHERE pm_status = 1 ORDER BY pm_id'
    );
    paymentMethods = pmRes.rows;

    // 2. Fetch active status options
    const statusRes = await db.query(
      'SELECT status_id, status_name FROM status_detail WHERE status_id IN (1, 2) ORDER BY status_id'
    );
    statusList = statusRes.rows;

    // 3. Calculate next receipt number
    const countRes = await db.query("SELECT COUNT(*) as count FROM daily_hisab_detail WHERE dl_hsb_code_no LIKE 'DH%'");
    const totalCount = parseInt(countRes.rows[0].count);
    nextHisabCode = `DH${totalCount + 1}`;

  } catch (err: any) {
    console.error('Failed to load daily hisab add parameters:', err.message);
  }

  return (
    <HisabAddForm
      nextHisabCode={nextHisabCode}
      paymentMethods={paymentMethods}
      statusList={statusList}
    />
  );
}
