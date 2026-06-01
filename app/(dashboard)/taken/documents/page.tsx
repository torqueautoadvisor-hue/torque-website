import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../lib/db';
import TakenDocumentsClient from './TakenDocumentsClient';

export default async function TakenDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    tkn_id?: string;
    flag?: string;
  }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    redirect('/');
  }

  const user = JSON.parse(session);
  const branchId = user.branch_id || 1;

  // Check permissions (Module ID 3 check)
  const permissions = user.md_id ? user.md_id.split(',') : [];
  if (user.adm_type !== 0 && !permissions.includes('3')) {
    redirect('/insurance');
  }

  const params = await searchParams;
  const tknIdStr = params.tkn_id;
  if (!tknIdStr) {
    redirect('/taken');
  }

  const tknId = parseInt(tknIdStr);
  if (isNaN(tknId)) {
    redirect('/taken');
  }

  let record: any = null;
  let documents: any[] = [];
  const flag = params.flag || '';

  try {
    // 1. Fetch Taken details
    const recRes = await db.query(
      'SELECT * FROM taken_detail WHERE tkn_id = $1 AND branch_id = $2 AND tkn_status != 3',
      [tknId, branchId]
    );

    if (recRes.rows.length === 0) {
      redirect('/taken');
    }
    record = recRes.rows[0];

    // 2. Fetch documents
    const docRes = await db.query(
      'SELECT * FROM document_detail WHERE tkn_id = $1 AND document_status != 3 ORDER BY document_id',
      [tknId]
    );
    documents = docRes.rows;

  } catch (err: any) {
    console.error('Failed to load taken documents page:', err.message);
    redirect('/taken');
  }

  return (
    <TakenDocumentsClient
      record={record}
      documents={documents}
      flag={flag}
    />
  );
}
