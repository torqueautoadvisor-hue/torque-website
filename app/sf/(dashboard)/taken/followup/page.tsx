import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../../lib/db';
import TakenFollowupForm from './TakenFollowupForm';

export default async function TakenFollowupPage({
  searchParams,
}: {
  searchParams: Promise<{
    tkn_id?: string;
    flag?: string;
  }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    redirect('/sf');
  }

  const user = JSON.parse(session);
  const branchId = user.branch_id || 1;

  // Check permissions (Module ID 3 check)
  const permissions = user.md_id ? user.md_id.split(',') : [];
  if (user.adm_type !== 0 && !permissions.includes('3')) {
    redirect('/sf/insurance');
  }

  const params = await searchParams;
  const tknIdStr = params.tkn_id;
  if (!tknIdStr) {
    redirect('/sf/taken');
  }

  const tknId = parseInt(tknIdStr);
  if (isNaN(tknId)) {
    redirect('/sf/taken');
  }

  let record: any = null;
  let followups: any[] = [];
  const flag = params.flag || '';

  try {
    // 1. Fetch main Taken record details
    const recRes = await db.query(
      'SELECT * FROM taken_detail WHERE tkn_id = $1 AND branch_id = $2 AND tkn_status != 3',
      [tknId, branchId]
    );
    if (recRes.rows.length === 0) {
      redirect('/sf/taken');
    }
    record = recRes.rows[0];

    // 2. Fetch past followups
    const flpRes = await db.query(
      `SELECT td.*, al.adm_username 
       FROM tkn_flp_detail td
       JOIN admin_login al ON al.adm_id = td.added_by
       WHERE td.tkn_id = $1 AND td.branch_id = $2
       ORDER BY td.tknflp_id DESC`,
      [tknId, branchId]
    );
    followups = flpRes.rows;

  } catch (err: any) {
    console.error('Failed to load taken followup page details:', err.message);
    redirect('/sf/taken');
  }

  return (
    <TakenFollowupForm
      record={record}
      followups={followups}
      flag={flag}
    />
  );
}
