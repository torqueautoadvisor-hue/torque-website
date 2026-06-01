import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../lib/db';
import AgentListClient from './AgentListClient';

export default async function AgentsPage({
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
      `SELECT ad.*, st.status_name 
       FROM agent_detail ad
       JOIN status_detail st ON st.status_id = ad.agt_status
       WHERE ad.agt_status IN (1, 2)
       ORDER BY ad.agt_id`
    );
    records = res.rows;
  } catch (err: any) {
    console.error('Failed to load agents:', err.message);
  }

  return <AgentListClient records={records} flag={flag} />;
}
