import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../../lib/db';
import CompanyEditForm from './CompanyEditForm';

export default async function CompanyEditPage({
  searchParams,
}: {
  searchParams: Promise<{ cmp_id?: string }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) redirect('/');

  const user = JSON.parse(session);
  if (user.adm_type !== 0) redirect('/insurance');

  const params = await searchParams;
  const cmpIdStr = params.cmp_id;
  if (!cmpIdStr) redirect('/setup/companies');

  const cmpId = parseInt(cmpIdStr);
  if (isNaN(cmpId)) redirect('/setup/companies');

  let record: any = null;
  let statuses: any[] = [];

  try {
    const recRes = await db.query(
      'SELECT * FROM company_detail WHERE cmp_id = $1 AND cmp_status IN (1, 2)',
      [cmpId]
    );
    if (recRes.rows.length === 0) redirect('/setup/companies');
    record = recRes.rows[0];

    const res = await db.query(
      'SELECT status_id, status_name FROM status_detail WHERE status_id IN (1, 2) ORDER BY status_id'
    );
    statuses = res.rows;
  } catch (err: any) {
    console.error('Failed to load company edit details:', err.message);
    redirect('/setup/companies');
  }

  return <CompanyEditForm record={record} statuses={statuses} />;
}
