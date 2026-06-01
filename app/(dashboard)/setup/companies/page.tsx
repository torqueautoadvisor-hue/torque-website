import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../lib/db';
import CompanyListClient from './CompanyListClient';

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ flag?: string }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) redirect('/');

  const user = JSON.parse(session);
  if (user.adm_type !== 0) redirect('/insurance');

  const params = await searchParams;
  const flag = params.flag || '';

  let records: any[] = [];
  try {
    const res = await db.query(
      `SELECT cd.*, st.status_name 
       FROM company_detail cd
       JOIN status_detail st ON st.status_id = cd.cmp_status
       WHERE cd.cmp_status IN (1, 2)
       ORDER BY cd.cmp_id`
    );
    records = res.rows;
  } catch (err: any) {
    console.error('Failed to load companies:', err.message);
  }

  return <CompanyListClient records={records} flag={flag} />;
}
