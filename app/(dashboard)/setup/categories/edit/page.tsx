import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../../lib/db';
import CategoryEditForm from './CategoryEditForm';

export default async function CategoryEditPage({
  searchParams,
}: {
  searchParams: Promise<{ ctg_id?: string }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) redirect('/');

  const user = JSON.parse(session);
  if (user.adm_type !== 0) redirect('/insurance');

  const params = await searchParams;
  const ctgIdStr = params.ctg_id;
  if (!ctgIdStr) redirect('/setup/categories');

  const ctgId = parseInt(ctgIdStr);
  if (isNaN(ctgId)) redirect('/setup/categories');

  let record: any = null;
  let statuses: any[] = [];

  try {
    const recRes = await db.query(
      'SELECT * FROM category_detail WHERE ctg_id = $1 AND ctg_status IN (1, 2)',
      [ctgId]
    );
    if (recRes.rows.length === 0) redirect('/setup/categories');
    record = recRes.rows[0];

    const res = await db.query(
      'SELECT status_id, status_name FROM status_detail WHERE status_id IN (1, 2) ORDER BY status_id'
    );
    statuses = res.rows;
  } catch (err: any) {
    console.error('Failed to load category edit details:', err.message);
    redirect('/setup/categories');
  }

  return <CategoryEditForm record={record} statuses={statuses} />;
}
