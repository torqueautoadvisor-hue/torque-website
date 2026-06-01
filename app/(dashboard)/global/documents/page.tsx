import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../lib/db';
import GlobalDocumentsClient from './GlobalDocumentsClient';

export default async function GlobalDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    glb_id?: string;
    flag?: string;
    msg?: string;
  }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    redirect('/');
  }

  const user = JSON.parse(session);
  const branchId = user.branch_id || 1;
  const adminId = user.adm_id;
  const isAdmin = user.adm_type === 0;

  // Resolve search parameters
  const params = await searchParams;
  const glbIdStr = params.glb_id;
  const flag = params.flag || '';
  const msg = params.msg || '';

  if (!glbIdStr) {
    redirect('/global');
  }

  const glbId = parseInt(glbIdStr);
  if (isNaN(glbId)) {
    redirect('/global');
  }

  let record: any = null;
  let documents: any[] = [];

  try {
    // 1. Fetch Global Record to verify existence and check ownership rights
    const recordRes = await db.query(
      'SELECT * FROM global_detail WHERE glb_id = $1 AND glb_status != 3 AND branch_id = $2',
      [glbId, branchId]
    );

    if (recordRes.rows.length === 0) {
      redirect('/global');
    }

    record = recordRes.rows[0];

    // Ownership guard: Sub-admins can only manage documents for their assigned records
    if (!isAdmin && record.glb_adm_id !== adminId) {
      redirect('/insurance');
    }

    // 2. Fetch associated documents (excluding status 3 - deleted)
    const docsRes = await db.query(
      `SELECT sd.*, st.status_name 
       FROM document_detail sd
       JOIN status_detail st ON sd.document_status = st.status_id
       WHERE sd.document_status != 3 AND sd.glb_id = $1
       ORDER BY sd.document_id`,
      [glbId]
    );
    documents = docsRes.rows;

  } catch (err: any) {
    console.error('Failed to load global documents:', err.message);
    redirect('/global');
  }

  return (
    <GlobalDocumentsClient
      glbId={glbId}
      record={record}
      documents={documents}
      flag={flag}
      msg={msg}
    />
  );
}
