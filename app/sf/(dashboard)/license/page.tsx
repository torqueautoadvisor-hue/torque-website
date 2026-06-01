import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../lib/db';
import LicenseListClient from './LicenseListClient';

export default async function LicenseListPage({
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
  const adminId = user.adm_id;
  const isAdmin = user.adm_type === 0;

  // Resolve search parameters
  const params = await searchParams;
  const strdate = params.strdate || '';
  const enddate = params.enddate || '';
  const flag = params.flag || '';

  let records: any[] = [];
  let staffList: any[] = [];
  let totalAmount = 0;
  let totalCredit = 0;
  let totalDebit = 0;

  try {
    // 1. Fetch Staff Sub-Admins list
    const staffRes = await db.query(
      'SELECT adm_id, adm_username FROM admin_login WHERE adm_status = 1 AND adm_id != 1 AND branch_id = $1 ORDER BY adm_username',
      [branchId]
    );
    staffList = staffRes.rows;

    // 2. Fetch Active Pending reasons catalog for status displays
    // (pen_res_detail maps pending reasons)
    const penResCatalog = await db.query('SELECT pen_res_id, pen_res_name FROM pen_res_detail');
    const penResMap = new Map(penResCatalog.rows.map(r => [r.pen_res_id, r.pen_res_name]));

    // 3. Compose main License list query (service_id = 1)
    let query = `SELECT rd.*, st.status_name, al.adm_username
                 FROM rto_detail rd
                 JOIN status_detail st ON st.status_id = rd.rto_status
                 LEFT JOIN admin_login al ON al.adm_id = rd.rto_adm_id
                 WHERE rd.service_id = 1 AND rd.rto_status != 3 AND rd.branch_id = $1`;

    const queryParams: any[] = [branchId];

    if (strdate && enddate) {
      queryParams.push(strdate, enddate);
      query += ` AND DATE(rd.rto_date) >= $2 AND DATE(rd.rto_date) <= $3`;
    }

    if (!isAdmin) {
      queryParams.push(adminId);
      query += ` AND rd.rto_adm_id = $${queryParams.length}`;
    }

    query += ` ORDER BY rd.rto_id`;

    const recordsRes = await db.query(query, queryParams);
    records = recordsRes.rows.map((row: any) => ({
      ...row,
      pen_res_name: penResMap.get(row.pen_res_id) || ''
    }));

    // Calculate aggregates matching filters
    records.forEach((row: any) => {
      totalAmount += parseFloat(row.rto_amount) || 0;
      totalCredit += parseFloat(row.rto_credit) || 0;
      totalDebit += parseFloat(row.rto_debit) || 0;
    });

  } catch (err: any) {
    console.error('Failed to load license records:', err.message);
  }

  return (
    <LicenseListClient
      records={records}
      staffList={staffList}
      isAdmin={isAdmin}
      branchId={branchId}
      initialStrdate={strdate}
      initialEnddate={enddate}
      totalAmount={totalAmount}
      totalCredit={totalCredit}
      totalDebit={totalDebit}
      flag={flag}
    />
  );
}
