import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../../lib/db';
import RenewalDocumentsClient from './RenewalDocumentsClient';

export default async function RenewalDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    ren_id?: string;
    flag?: string;
  }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    redirect('/sf');
  }

  const user = JSON.parse(session);
  const branchId = user.branch_id || 1;

  // Check permissions (Module ID 3 check)
  const permissions = user.md_id ? user.md_id.split(',') : [];
  if (user.adm_type !== 0 && !permissions.includes('3')) {
    redirect('/sf/insurance');
  }

  const params = await searchParams;
  const renIdStr = params.ren_id;
  if (!renIdStr) {
    redirect('/sf/renewal');
  }

  const renId = parseInt(renIdStr);
  if (isNaN(renId)) {
    redirect('/sf/renewal');
  }

  let record: any = null;
  let documents: any[] = [];
  const flag = params.flag || '';

  try {
    // 1. Fetch Renewal details
    const recRes = await db.query(
      'SELECT * FROM renewal_detail WHERE ren_id = $1 AND branch_id = $2 AND ren_status != 3',
      [renId, branchId]
    );

    if (recRes.rows.length === 0) {
      redirect('/sf/renewal');
    }
    record = recRes.rows[0];

    // 2. Fetch documents
    const docRes = await db.query(
      'SELECT * FROM document_detail WHERE ren_id = $1 AND document_status != 3 ORDER BY document_id',
      [renId]
    );
    documents = docRes.rows;

  } catch (err: any) {
    console.error('Failed to load renewal documents page:', err.message);
    redirect('/sf/renewal');
  }

  return (
    <RenewalDocumentsClient
      record={record}
      documents={documents}
      flag={flag}
    />
  );
}
