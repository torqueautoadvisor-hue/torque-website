import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../../lib/db';
import InquiryEditForm from './InquiryEditForm';

export default async function InquiryEditPage({
  searchParams,
}: {
  searchParams: Promise<{
    inq_id?: string;
  }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    redirect('/sf');
  }

  const user = JSON.parse(session);
  const branchId = user.branch_id || 1;
  const isAdmin = user.adm_type === 0;

  // Check permissions (Module ID 3 check)
  const permissions = user.md_id ? user.md_id.split(',') : [];
  if (user.adm_type !== 0 && !permissions.includes('3')) {
    redirect('/sf/insurance');
  }

  const params = await searchParams;
  const inqIdStr = params.inq_id;
  if (!inqIdStr) {
    redirect('/sf/inquiries');
  }

  const inqId = parseInt(inqIdStr);
  if (isNaN(inqId)) {
    redirect('/sf/inquiries');
  }

  let record: any = null;
  let reasonsList: any[] = [];
  let statusList: any[] = [];

  try {
    // 1. Fetch existing inquiry
    let query = 'SELECT * FROM inquiry_detail WHERE inq_id = $1 AND branch_id = $2 AND inq_status != 3';
    const queryParams: any[] = [inqId, branchId];

    if (!isAdmin) {
      queryParams.push(user.adm_id);
      query += ` AND added_by = $3`;
    }

    const recRes = await db.query(query, queryParams);
    if (recRes.rows.length === 0) {
      redirect('/sf/inquiries');
    }
    record = recRes.rows[0];

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

  } catch (err: any) {
    console.error('Failed to load inquiry edit details:', err.message);
    redirect('/sf/inquiries');
  }

  return (
    <InquiryEditForm
      record={record}
      reasonsList={reasonsList}
      statusList={statusList}
    />
  );
}
