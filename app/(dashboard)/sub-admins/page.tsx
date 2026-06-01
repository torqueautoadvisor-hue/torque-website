import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../lib/db';
import SubAdminListClient from './SubAdminListClient';

export default async function SubAdminsPage({
  searchParams,
}: {
  searchParams: Promise<{
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

  // Restrict access strictly to Master Admins
  if (user.adm_type !== 0) {
    redirect('/insurance');
  }

  const params = await searchParams;
  const flag = params.flag || '';

  let records: any[] = [];

  try {
    const res = await db.query(
      `SELECT al.*, st.status_name, act.adm_cat_name
       FROM admin_login al
       JOIN status_detail st ON st.status_id = al.adm_status
       JOIN admin_category_detail act ON act.adm_cat_id = al.adm_cat_id
       WHERE al.branch_id = $1 AND al.adm_type != 0 AND al.adm_status IN (1, 2)
       ORDER BY al.adm_id`,
      [branchId]
    );
    records = res.rows;
  } catch (err: any) {
    console.error('Failed to load sub admins:', err.message);
  }

  return (
    <SubAdminListClient
      records={records}
      flag={flag}
    />
  );
}
