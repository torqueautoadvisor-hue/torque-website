import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../lib/db';
import FitperListClient from './FitperListClient';

export default async function FitperListPage({
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
    // Fetch active records (fp_status != 3) under branch confinement
    const recordsRes = await db.query(
      `SELECT * FROM fitper_detail 
       WHERE fp_status != 3 AND branch_id = $1 
       ORDER BY fp_id DESC`,
      [branchId]
    );
    records = recordsRes.rows;

  } catch (err: any) {
    console.error('Failed to load fitness & permit records:', err.message);
  }

  return (
    <FitperListClient
      records={records}
      isAdmin={isAdmin}
      branchId={branchId}
      flag={flag}
    />
  );
}
