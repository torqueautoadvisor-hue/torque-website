import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../lib/db';
import UghraniEditForm from './UghraniEditForm';

export default async function UghraniEditPage({
  searchParams,
}: {
  searchParams: Promise<{ ugh_id?: string }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    redirect('/');
  }

  const user = JSON.parse(session);
  const branchId = user.branch_id || 1;
  const isAdmin = user.adm_type === 0;

  const params = await searchParams;
  const ughIdStr = params.ugh_id;
  if (!ughIdStr) {
    redirect('/ughrani');
  }

  const ughId = parseInt(ughIdStr);
  if (isNaN(ughId)) {
    redirect('/ughrani');
  }

  let record: any = null;

  try {
    const recordRes = await db.query(
      'SELECT * FROM ughrani_detail WHERE ugh_id = $1 AND ugh_status != 3',
      [ughId]
    );

    if (recordRes.rowCount === 0) {
      redirect('/ughrani');
    }

    record = recordRes.rows[0];

    // Branch confinement validation
    if (record.branch_id !== branchId) {
      redirect('/ughrani');
    }

  } catch (err: any) {
    console.error('Failed to load edit ughrani record:', err.message);
    redirect('/ughrani');
  }

  return (
    <UghraniEditForm
      record={record}
      branchId={branchId}
      isAdmin={isAdmin}
    />
  );
}
