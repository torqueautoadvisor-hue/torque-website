import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../lib/db';
import RenewalRemindersClient from './RenewalRemindersClient';

export default async function RenewalRemindersPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    redirect('/');
  }

  const user = JSON.parse(session);
  const branchId = user.branch_id || 1;
  const adminId = user.adm_id;
  const isAdmin = user.adm_type === 0;

  let records: any[] = [];
  let staffList: any[] = [];

  try {
    if (isAdmin) {
      const staffRes = await db.query(
        'SELECT adm_id, adm_username FROM admin_login WHERE adm_status = 1 AND adm_id != 1 AND branch_id = $1 ORDER BY adm_username',
        [branchId]
      );
      staffList = staffRes.rows;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    let query = `SELECT td.*, st.status_name, al.adm_username, rj.rej_res_name
                 FROM renewal_detail td
                 JOIN status_detail st ON st.status_id = td.ren_status
                 LEFT JOIN admin_login al ON al.adm_id = td.ren_adm_id
                 LEFT JOIN rej_res_detail rj ON rj.rej_res_id = td.rej_res_id
                 WHERE td.ren_status != 3 AND td.ren_action IN ('1', '2')
                 AND (DATE(td.ren_insurance_date) <= $2 OR DATE(td.ren_permit_date) <= $2 OR DATE(td.ren_nat_permit_date) <= $2)
                 AND td.branch_id = $1`;

    const queryParams: any[] = [branchId, todayStr];

    if (!isAdmin) {
      queryParams.push(adminId);
      query += ` AND td.ren_adm_id = $3`;
    }

    query += ` ORDER BY td.ren_id`;

    const res = await db.query(query, queryParams);
    records = res.rows;

  } catch (err: any) {
    console.error('Failed to load renewal reminders:', err.message);
  }

  return (
    <RenewalRemindersClient
      records={records}
      staffList={staffList}
      isAdmin={isAdmin}
      branchId={branchId}
    />
  );
}
