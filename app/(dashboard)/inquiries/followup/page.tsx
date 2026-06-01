import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../lib/db';
import InquiryFollowupForm from './InquiryFollowupForm';

export default async function InquiryFollowupPage({
  searchParams,
}: {
  searchParams: Promise<{
    inq_id?: string;
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
  const inqIdStr = params.inq_id;
  if (!inqIdStr) {
    redirect('/inquiries');
  }

  const inqId = parseInt(inqIdStr);
  if (isNaN(inqId)) {
    redirect('/inquiries');
  }

  let inquiry: any = null;
  let followups: any[] = [];
  const flag = params.flag || '';

  try {
    // 1. Fetch main inquiry details
    const inqRes = await db.query(
      'SELECT * FROM inquiry_detail WHERE inq_id = $1 AND branch_id = $2 AND inq_status != 3',
      [inqId, branchId]
    );
    if (inqRes.rows.length === 0) {
      redirect('/inquiries');
    }
    inquiry = inqRes.rows[0];

    // 2. Fetch past follow-ups
    const flpRes = await db.query(
      `SELECT td.*, al.adm_username 
       FROM inq_flp_detail td
       JOIN admin_login al ON al.adm_id = td.added_by
       WHERE td.inq_id = $1 AND td.branch_id = $2
       ORDER BY td.inqflp_id DESC`,
      [inqId, branchId]
    );
    followups = flpRes.rows;

  } catch (err: any) {
    console.error('Failed to load followup page details:', err.message);
    redirect('/inquiries');
  }

  return (
    <InquiryFollowupForm
      inquiry={inquiry}
      followups={followups}
      flag={flag}
    />
  );
}
