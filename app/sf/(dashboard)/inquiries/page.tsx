import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../lib/db';
import InquiryListClient from './InquiryListClient';

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{
    strdate?: string;
    enddate?: string;
    flag?: string;
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
  const strdate = params.strdate || '';
  const enddate = params.enddate || '';
  const flag = params.flag || '';

  let records: any[] = [];

  try {
    let query = `SELECT td.*, st.status_name, rj.rej_res_name
                 FROM inquiry_detail td
                 JOIN status_detail st ON st.status_id = td.inq_status
                 LEFT JOIN rej_res_detail rj ON rj.rej_res_id = td.rej_res_id
                 WHERE td.inq_status != 3 AND td.inq_action IN ('1', '2', '3') AND td.branch_id = $1`;

    const queryParams: any[] = [branchId];

    if (strdate && enddate) {
      queryParams.push(strdate, enddate);
      query += ` AND DATE(td.inq_date) >= $2 AND DATE(td.inq_date) <= $3`;
    }

    query += ` ORDER BY td.inq_id`;

    const res = await db.query(query, queryParams);
    records = res.rows;
  } catch (err: any) {
    console.error('Failed to load inquiries:', err.message);
  }

  return (
    <InquiryListClient
      records={records}
      isAdmin={isAdmin}
      initialStrdate={strdate}
      initialEnddate={enddate}
      flag={flag}
    />
  );
}
