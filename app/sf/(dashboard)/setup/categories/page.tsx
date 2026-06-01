import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../../lib/db';
import CategoryListClient from './CategoryListClient';

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ flag?: string }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) redirect('/sf');

  const user = JSON.parse(session);
  if (user.adm_type !== 0) redirect('/sf/insurance');

  const params = await searchParams;
  const flag = params.flag || '';

  let records: any[] = [];
  try {
    const res = await db.query(
      `SELECT cd.*, st.status_name 
       FROM category_detail cd
       JOIN status_detail st ON st.status_id = cd.ctg_status
       WHERE cd.ctg_status IN (1, 2)
       ORDER BY cd.ctg_id`
    );
    records = res.rows;
  } catch (err: any) {
    console.error('Failed to load categories:', err.message);
  }

  return <CategoryListClient records={records} flag={flag} />;
}
