import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../lib/db';
import RenewalFollowupForm from './RenewalFollowupForm';

export default async function RenewalFollowupPage({
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
    redirect('/');
  }

  const user = JSON.parse(session);
  const branchId = user.branch_id || 1;

  // Check permissions (Module ID 3 check)
  const permissions = user.md_id ? user.md_id.split(',') : [];
  if (user.adm_type !== 0 && !permissions.includes('3')) {
    redirect('/insurance');
  }

  const params = await searchParams;
  const renIdStr = params.ren_id;
  if (!renIdStr) {
    redirect('/renewal');
  }

  const renId = parseInt(renIdStr);
  if (isNaN(renId)) {
    redirect('/renewal');
  }

  let record: any = null;
  let followups: any[] = [];
  const flag = params.flag || '';

  try {
    // 1. Fetch main Renewal details
    const recRes = await db.query(
      'SELECT * FROM renewal_detail WHERE ren_id = $1 AND branch_id = $2 AND ren_status != 3',
      [renId, branchId]
    );
    if (recRes.rows.length === 0) {
      redirect('/renewal');
    }
    record = recRes.rows[0];

    // 2. Fetch past followups
    const flpRes = await db.query(
      `SELECT td.*, al.adm_username 
       FROM ren_flp_detail td
       JOIN admin_login al ON al.adm_id = td.added_by
       WHERE td.ren_id = $1 AND td.branch_id = $2
       ORDER BY td.renflp_id DESC`,
      [renId, branchId]
    );
    followups = flpRes.rows;

  } catch (err: any) {
    console.error('Failed to load renewal followup page details:', err.message);
    redirect('/renewal');
  }

  return (
    <RenewalFollowupForm
      record={record}
      followups={followups}
      flag={flag}
    />
  );
}
