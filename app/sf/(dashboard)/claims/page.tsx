import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../lib/db';
import ClaimListClient from './ClaimListClient';

export default async function ClaimsListPage({
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

  // Resolve search parameters from App Router search parameters
  const params = await searchParams;
  const strdate = params.strdate || '';
  const enddate = params.enddate || '';
  const flag = params.flag || '';

  let records: any[] = [];
  let staffList: any[] = [];

  try {
    // 1. Fetch Staff Sub-Admins list for assigned staff names
    const staffRes = await db.query(
      'SELECT adm_id, adm_username FROM admin_login WHERE adm_status = 1 AND adm_id != 1 AND branch_id = $1 ORDER BY adm_username',
      [branchId]
    );
    staffList = staffRes.rows;

    // 2. Compose main Claims list query with dynamic date filters
    let query = `SELECT cd.*, st.status_name, al.adm_username
                 FROM claim_detail cd
                 JOIN status_detail st ON st.status_id = cd.clm_status
                 LEFT JOIN admin_login al ON al.adm_id = cd.clm_adm_id
                 WHERE cd.clm_status != 3 AND cd.branch_id = $1`;

    const queryParams: any[] = [branchId];

    if (strdate && enddate) {
      queryParams.push(strdate, enddate);
      query += ` AND DATE(cd.clm_date) >= $2 AND DATE(cd.clm_date) <= $3`;
    }

    // Filter to only display records assigned to the sub-admin if not master admin
    if (!isAdmin) {
      queryParams.push(adminId);
      query += ` AND cd.clm_adm_id = $${queryParams.length}`;
    }

    query += ` ORDER BY cd.clm_id`;

    const recordsRes = await db.query(query, queryParams);
    records = recordsRes.rows;

  } catch (err: any) {
    console.error('Failed to load claims records:', err.message);
  }

  return (
    <ClaimListClient
      records={records}
      staffList={staffList}
      isAdmin={isAdmin}
      branchId={branchId}
      initialStrdate={strdate}
      initialEnddate={enddate}
      flag={flag}
    />
  );
}
