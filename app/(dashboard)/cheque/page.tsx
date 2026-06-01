import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../lib/db';
import ChequeListClient from './ChequeListClient';

export default async function ChequeListPage({
  searchParams,
}: {
  searchParams: Promise<{ flag?: string }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    redirect('/');
  }

  const user = JSON.parse(session);
  const branchId = user.branch_id || 1;
  const isAdmin = user.adm_type === 0;

  // Resolve search parameters
  const params = await searchParams;
  const flag = params.flag || '';

  let records: any[] = [];

  try {
    // Fetch active cheque records under branch confinement
    const recordsRes = await db.query(
      `SELECT * FROM cheque_detail 
       WHERE chq_status != 3 AND branch_id = $1 
       ORDER BY chq_id DESC`,
      [branchId]
    );
    records = recordsRes.rows;

  } catch (err: any) {
    console.error('Failed to load cheque records:', err.message);
  }

  return (
    <ChequeListClient
      records={records}
      isAdmin={isAdmin}
      branchId={branchId}
      flag={flag}
    />
  );
}
