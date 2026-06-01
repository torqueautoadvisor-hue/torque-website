import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../../lib/db';
import ClaimDocumentsClient from './ClaimDocumentsClient';

export default async function ClaimDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ clm_id?: string; flag?: string }>;
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
  const clmIdStr = params.clm_id;
  const flag = params.flag || '';

  if (!clmIdStr) {
    redirect('/sf/claims');
  }

  const clmId = parseInt(clmIdStr);
  if (isNaN(clmId)) {
    redirect('/sf/claims');
  }

  let claimRecord: any = null;
  let documents: any[] = [];

  try {
    // 1. Fetch Claim Record and verify access
    const claimRes = await db.query(
      'SELECT * FROM claim_detail WHERE clm_id = $1 AND clm_status != 3',
      [clmId]
    );

    if (claimRes.rowCount === 0) {
      redirect('/sf/claims');
    }

    claimRecord = claimRes.rows[0];

    // Branch confinement validation
    if (claimRecord.branch_id !== branchId) {
      redirect('/sf/claims');
    }

    // Role boundary validation: non-admins can only view their own assigned claims' documents
    if (!isAdmin && claimRecord.clm_adm_id !== adminId) {
      redirect('/sf/claims');
    }

    // 2. Fetch all support documents uploaded for this claim
    const docsRes = await db.query(
      `SELECT sd.*, st.status_name 
       FROM document_detail sd
       JOIN status_detail st ON st.status_id = sd.document_status
       WHERE sd.clm_id = $1 AND sd.document_status != 3 
       ORDER BY sd.document_id DESC`,
      [clmId]
    );
    documents = docsRes.rows;

  } catch (err: any) {
    console.error('Failed to load claim documents page:', err.message);
    redirect('/sf/claims');
  }

  return (
    <ClaimDocumentsClient
      claimRecord={claimRecord}
      documents={documents}
      clmId={clmId}
      flag={flag}
      isAdmin={isAdmin}
    />
  );
}
