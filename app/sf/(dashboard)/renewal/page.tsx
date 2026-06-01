import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../lib/db';
import RenewalListClient from './RenewalListClient';

export default async function RenewalListPage({
  searchParams,
}: {
  searchParams: Promise<{
    strdate?: string;
    enddate?: string;
    date_type?: string;
    msg?: string;
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
  const adminId = user.adm_id;
  const isAdmin = user.adm_type === 0;

  // Resolve search parameters from App Router search parameters
  const params = await searchParams;
  const strdate = params.strdate || '';
  const enddate = params.enddate || '';
  const dateType = params.date_type || '1';
  const flag = params.flag || '';

  let records: any[] = [];
  let staffList: any[] = [];

  try {
    // 1. Fetch Staff Sub-Admins list for bulk re-assign dropdown (Admins only)
    if (isAdmin) {
      const staffRes = await db.query(
        'SELECT adm_id, adm_username FROM admin_login WHERE adm_status = 1 AND adm_id != 1 AND branch_id = $1 ORDER BY adm_username',
        [branchId]
      );
      staffList = staffRes.rows;
    }

    // 2. Compose main Renewal records query with dynamic date filters
    let query = `SELECT td.*, st.status_name, al.adm_username, rj.rej_res_name
                 FROM renewal_detail td
                 JOIN status_detail st ON st.status_id = td.ren_status
                 LEFT JOIN admin_login al ON al.adm_id = td.ren_adm_id
                 LEFT JOIN rej_res_detail rj ON rj.rej_res_id = td.rej_res_id
                 WHERE td.ren_status != 3 AND td.ren_action IN ('1', '2') AND td.branch_id = $1`;

    const queryParams: any[] = [branchId];

    if (strdate && enddate) {
      let dateField = 'td.ren_insurance_date';
      if (dateType === '2') dateField = 'td.ren_cf_date';
      else if (dateType === '3') dateField = 'td.ren_reg_date';
      else if (dateType === '4') dateField = 'td.ren_permit_date';
      else if (dateType === '5') dateField = 'td.ren_nat_permit_date';
      else if (dateType === '6') dateField = 'td.ren_tax_date';

      queryParams.push(strdate, enddate);
      query += ` AND DATE(${dateField}) >= $2 AND DATE(${dateField}) <= $3`;
    }

    // Filter to only display records assigned to the sub-admin if not master admin
    if (!isAdmin) {
      queryParams.push(adminId);
      query += ` AND td.ren_adm_id = $${queryParams.length}`;
    }

    query += ` ORDER BY td.ren_id`;

    const recordsRes = await db.query(query, queryParams);
    records = recordsRes.rows;

  } catch (err: any) {
    console.error('Failed to load renewal records:', err.message);
  }

  return (
    <RenewalListClient
      records={records}
      staffList={staffList}
      isAdmin={isAdmin}
      branchId={branchId}
      initialStrdate={strdate}
      initialEnddate={enddate}
      initialDateType={dateType}
      flag={flag}
    />
  );
}
