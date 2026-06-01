import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../../lib/db';
import LicenseDocumentsClient from './LicenseDocumentsClient';

export default async function LicenseDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ rto_id?: string; flag?: string }>;
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

  const params = await searchParams;
  const rtoIdStr = params.rto_id;
  const flag = params.flag || '';

  if (!rtoIdStr) {
    redirect('/sf/license');
  }

  const rtoId = parseInt(rtoIdStr);
  if (isNaN(rtoId)) {
    redirect('/sf/license');
  }

  let rtoRecord: any = null;
  let documents: any[] = [];

  try {
    // 1. Fetch RTO Record (service_id = 1)
    const rtoRes = await db.query(
      'SELECT * FROM rto_detail WHERE rto_id = $1 AND service_id = 1 AND rto_status != 3',
      [rtoId]
    );

    if (rtoRes.rowCount === 0) {
      redirect('/sf/license');
    }

    rtoRecord = rtoRes.rows[0];

    // Branch confinement
    if (rtoRecord.branch_id !== branchId) {
      redirect('/sf/license');
    }

    // Role boundary validation
    if (!isAdmin && rtoRecord.rto_adm_id !== adminId) {
      redirect('/sf/license');
    }

    // 2. Fetch related document attachments
    const docsRes = await db.query(
      `SELECT sd.*, st.status_name 
       FROM document_detail sd
       JOIN status_detail st ON st.status_id = sd.document_status
       WHERE sd.rto_id = $1 AND sd.document_status != 3 
       ORDER BY sd.document_id DESC`,
      [rtoId]
    );
    documents = docsRes.rows;

  } catch (err: any) {
    console.error('Failed to load license documents page:', err.message);
    redirect('/sf/license');
  }

  return (
    <LicenseDocumentsClient
      rtoRecord={rtoRecord}
      documents={documents}
      rtoId={rtoId}
      flag={flag}
      isAdmin={isAdmin}
    />
  );
}
