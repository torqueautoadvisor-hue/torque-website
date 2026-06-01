import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../lib/db';
import UghraniListClient from './UghraniListClient';

export default async function UghraniListPage({
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
    const recordsRes = await db.query(
      `SELECT * FROM ughrani_detail
       WHERE ugh_status != 3 AND branch_id = $1 
       ORDER BY ugh_id DESC`,
      [branchId]
    );
    records = recordsRes.rows;

  } catch (err: any) {
    console.error('Failed to load ughrani records:', err.message);
  }

  return (
    <UghraniListClient
      records={records}
      isAdmin={isAdmin}
      branchId={branchId}
      flag={flag}
    />
  );
}
