import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../../lib/db';
import SubAdminAddForm from './SubAdminAddForm';

export default async function SubAdminAddPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    redirect('/sf');
  }

  const user = JSON.parse(session);

  // Restrict access strictly to Master Admins
  if (user.adm_type !== 0) {
    redirect('/sf/insurance');
  }

  let categories: any[] = [];
  let modules: any[] = [];
  let statuses: any[] = [];

  try {
    // 1. Fetch Admin Categories
    const catRes = await db.query(
      'SELECT adm_cat_id, adm_cat_name FROM admin_category_detail WHERE adm_cat_status = 1 ORDER BY adm_cat_id'
    );
    categories = catRes.rows;

    // 2. Fetch Module checklists (excluding dashboard/common module id 2)
    const modRes = await db.query(
      "SELECT md_id, md_name FROM module_detail WHERE md_status = '1' AND md_id != 2 ORDER BY md_id"
    );
    modules = modRes.rows;

    // 3. Fetch status mappings (Active - 1, Inactive - 2)
    const statRes = await db.query(
      'SELECT status_id, status_name FROM status_detail WHERE status_id IN (1, 2) ORDER BY status_id'
    );
    statuses = statRes.rows;

  } catch (err: any) {
    console.error('Failed to load sub admin add details:', err.message);
  }

  return (
    <SubAdminAddForm
      categories={categories}
      modules={modules}
      statuses={statuses}
    />
  );
}
