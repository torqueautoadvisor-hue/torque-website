import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../lib/db';
import SalaryListClient from './SalaryListClient';

export default async function SalaryListPage({
  searchParams,
}: {
  searchParams: Promise<{ flag?: string }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    redirect('/sf');
  }

  const user = JSON.parse(session);
  const branchId = user.branch_id || 1;
  const isAdmin = user.adm_type === 0;

  // Resolve search parameters
  const params = await searchParams;
  const flag = params.flag || '';

  let records: any[] = [];

  try {
    // Fetch active salary logs with associated staff usernames in branch
    const recordsRes = await db.query(
      `SELECT sd.*, al.adm_username
       FROM salary_detail sd
       JOIN admin_login al ON al.adm_id = sd.adm_id
       WHERE sd.slr_status != 3 AND sd.branch_id = $1 
       ORDER BY sd.slr_id DESC`,
      [branchId]
    );
    records = recordsRes.rows;

  } catch (err: any) {
    console.error('Failed to load salary records:', err.message);
  }

  return (
    <SalaryListClient
      records={records}
      isAdmin={isAdmin}
      branchId={branchId}
      flag={flag}
    />
  );
}
