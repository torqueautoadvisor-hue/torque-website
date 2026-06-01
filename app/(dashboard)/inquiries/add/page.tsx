import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../lib/db';
import InquiryAddForm from './InquiryAddForm';

export default async function InquiryAddPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    redirect('/');
  }

  const user = JSON.parse(session);

  // Check permissions (Module ID 3 check)
  const permissions = user.md_id ? user.md_id.split(',') : [];
  if (user.adm_type !== 0 && !permissions.includes('3')) {
    redirect('/insurance');
  }

  let reasonsList: any[] = [];
  let statusList: any[] = [];
  let nextInqCode = 'INQ1';

  try {
    // 1. Fetch Reasons
    const reasonsRes = await db.query(
      'SELECT rej_res_id, rej_res_name FROM rej_res_detail WHERE rej_res_status = 1 ORDER BY rej_res_name'
    );
    reasonsList = reasonsRes.rows;

    // 2. Fetch Statuses
    const statusRes = await db.query(
      'SELECT status_id, status_name FROM status_detail WHERE status_id != 3 ORDER BY status_id'
    );
    statusList = statusRes.rows;

    // 3. Calculate next code
    const countRes = await db.query("SELECT COUNT(*) as count FROM inquiry_detail WHERE inq_code_no LIKE 'INQ%'");
    const totalCount = parseInt(countRes.rows[0].count);
    nextInqCode = `INQ${totalCount + 1}`;

  } catch (err: any) {
    console.error('Failed to load inquiry addition details:', err.message);
  }

  return (
    <InquiryAddForm
      nextInqCode={nextInqCode}
      reasonsList={reasonsList}
      statusList={statusList}
    />
  );
}
