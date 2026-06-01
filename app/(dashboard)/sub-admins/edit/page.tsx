import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../lib/db';
import SubAdminEditForm from './SubAdminEditForm';

export default async function SubAdminEditPage({
  searchParams,
}: {
  searchParams: Promise<{
    adm_id?: string;
  }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    redirect('/');
  }

  const user = JSON.parse(session);

  // Restrict access strictly to Master Admins
  if (user.adm_type !== 0) {
    redirect('/insurance');
  }

  const params = await searchParams;
  const admIdStr = params.adm_id;
  if (!admIdStr) {
    redirect('/sub-admins');
  }

  const admId = parseInt(admIdStr);
  if (isNaN(admId)) {
    redirect('/sub-admins');
  }

  let record: any = null;
  let categories: any[] = [];
  let modules: any[] = [];
  let statuses: any[] = [];

  try {
    // 1. Fetch sub-admin record (exclude master admin)
    const recordRes = await db.query(
      'SELECT * FROM admin_login WHERE adm_id = $1 AND adm_type != 0 AND adm_status IN (1, 2)',
      [admId]
    );
    if (recordRes.rows.length === 0) {
      redirect('/sub-admins');
    }
    record = recordRes.rows[0];

    // 2. Fetch categories
    const catRes = await db.query(
      'SELECT adm_cat_id, adm_cat_name FROM admin_category_detail WHERE adm_cat_status = 1 ORDER BY adm_cat_id'
    );
    categories = catRes.rows;

    // 3. Fetch modules
    const modRes = await db.query(
      "SELECT md_id, md_name FROM module_detail WHERE md_status = '1' AND md_id != 2 ORDER BY md_id"
    );
    modules = modRes.rows;

    // 4. Fetch statuses
    const statRes = await db.query(
      'SELECT status_id, status_name FROM status_detail WHERE status_id IN (1, 2) ORDER BY status_id'
    );
    statuses = statRes.rows;

  } catch (err: any) {
    console.error('Failed to load sub admin details for edit:', err.message);
    redirect('/sub-admins');
  }

  return (
    <SubAdminEditForm
      record={record}
      categories={categories}
      modules={modules}
      statuses={statuses}
    />
  );
}
