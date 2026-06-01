import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../lib/db';
import HisabListClient from './HisabListClient';

export default async function DailyHisabPage({
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
  if (!session) redirect('/sf');

  const user = JSON.parse(session);
  const branchId = user.branch_id || 1;
  const isAdmin = user.adm_type === 0;

  // Check permissions (Module ID 9 check)
  const permissions = user.md_id ? user.md_id.split(',') : [];
  if (user.adm_type !== 0 && !permissions.includes('9')) {
    redirect('/sf/insurance');
  }

  const params = await searchParams;
  const strdate = params.strdate || '';
  const enddate = params.enddate || '';
  const flag = params.flag || '';

  let records: any[] = [];

  try {
    let query = `SELECT td.*, pm.pm_name, al.adm_username
                 FROM daily_hisab_detail td
                 JOIN pay_method_detail pm ON pm.pm_id = td.pm_id
                 LEFT JOIN admin_login al ON al.adm_id = td.dl_hsb_adm_id
                 WHERE td.dl_hsb_status != 3 AND td.branch_id = $1`;

    const queryParams: any[] = [branchId];

    if (strdate && enddate) {
      queryParams.push(strdate, enddate);
      query += ` AND DATE(td.dl_hsb_date) >= $2 AND DATE(td.dl_hsb_date) <= $3`;
    }

    if (!isAdmin) {
      queryParams.push(user.adm_id);
      query += ` AND td.dl_hsb_adm_id = $${queryParams.length}`;
    }

    query += ` ORDER BY td.dl_hsb_id DESC`;

    const res = await db.query(query, queryParams);
    records = res.rows;
  } catch (err: any) {
    console.error('Failed to load daily hisab records:', err.message);
  }

  return (
    <HisabListClient
      records={records}
      isAdmin={isAdmin}
      initialStrdate={strdate}
      initialEnddate={enddate}
      flag={flag}
    />
  );
}
