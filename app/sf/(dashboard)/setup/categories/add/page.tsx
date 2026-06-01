import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../../../lib/db';
import CategoryAddForm from './CategoryAddForm';

export default async function CategoryAddPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) redirect('/sf');

  const user = JSON.parse(session);
  if (user.adm_type !== 0) redirect('/sf/insurance');

  let statuses: any[] = [];
  try {
    const res = await db.query(
      'SELECT status_id, status_name FROM status_detail WHERE status_id IN (1, 2) ORDER BY status_id'
    );
    statuses = res.rows;
  } catch (err: any) {
    console.error('Failed to load statuses:', err.message);
  }

  return <CategoryAddForm statuses={statuses} />;
}
