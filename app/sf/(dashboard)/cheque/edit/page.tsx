import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../../lib/db';
import ChequeEditForm from './ChequeEditForm';

export default async function ChequeEditPage({
  searchParams,
}: {
  searchParams: Promise<{ chq_id?: string }>;
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
  const chqIdStr = params.chq_id;
  if (!chqIdStr) {
    redirect('/sf/cheque');
  }

  const chqId = parseInt(chqIdStr);
  if (isNaN(chqId)) {
    redirect('/sf/cheque');
  }

  let record: any = null;

  try {
    // Fetch active Cheque Record
    const recordRes = await db.query(
      'SELECT * FROM cheque_detail WHERE chq_id = $1 AND chq_status != 3',
      [chqId]
    );

    if (recordRes.rowCount === 0) {
      redirect('/sf/cheque');
    }

    record = recordRes.rows[0];

    // Branch confinement validation
    if (record.branch_id !== branchId) {
      redirect('/sf/cheque');
    }

  } catch (err: any) {
    console.error('Failed to load edit cheque record:', err.message);
    redirect('/sf/cheque');
  }

  return (
    <ChequeEditForm
      record={record}
      branchId={branchId}
      isAdmin={isAdmin}
    />
  );
}
