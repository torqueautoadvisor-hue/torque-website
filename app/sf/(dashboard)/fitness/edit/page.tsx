import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../../lib/db';
import FitperEditForm from './FitperEditForm';

export default async function FitperEditPage({
  searchParams,
}: {
  searchParams: Promise<{ fp_id?: string }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    redirect('/sf');
  }

  const user = JSON.parse(session);
  const branchId = user.branch_id || 1;
  const isAdmin = user.adm_type === 0;

  const params = await searchParams;
  const fpIdStr = params.fp_id;
  if (!fpIdStr) {
    redirect('/sf/fitness');
  }

  const fpId = parseInt(fpIdStr);
  if (isNaN(fpId)) {
    redirect('/sf/fitness');
  }

  let record: any = null;

  try {
    // 1. Fetch Fitness & Permit Record
    const recordRes = await db.query(
      'SELECT * FROM fitper_detail WHERE fp_id = $1 AND fp_status != 3',
      [fpId]
    );

    if (recordRes.rowCount === 0) {
      redirect('/sf/fitness');
    }

    record = recordRes.rows[0];

    // Branch confinement validation
    if (record.branch_id !== branchId) {
      redirect('/sf/fitness');
    }

  } catch (err: any) {
    console.error('Failed to load edit fitness record:', err.message);
    redirect('/sf/fitness');
  }

  return (
    <FitperEditForm
      record={record}
      branchId={branchId}
      isAdmin={isAdmin}
    />
  );
}
