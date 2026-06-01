import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../../../lib/db';
import AgentEditForm from './AgentEditForm';

export default async function AgentEditPage({
  searchParams,
}: {
  searchParams: Promise<{ agt_id?: string }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) redirect('/sf');

  const user = JSON.parse(session);
  if (user.adm_type !== 0) redirect('/sf/insurance');

  const params = await searchParams;
  const agtIdStr = params.agt_id;
  if (!agtIdStr) redirect('/sf/setup/agents');

  const agtId = parseInt(agtIdStr);
  if (isNaN(agtId)) redirect('/sf/setup/agents');

  let record: any = null;
  let statuses: any[] = [];

  try {
    const recRes = await db.query(
      'SELECT * FROM agent_detail WHERE agt_id = $1 AND agt_status IN (1, 2)',
      [agtId]
    );
    if (recRes.rows.length === 0) redirect('/sf/setup/agents');
    record = recRes.rows[0];

    const res = await db.query(
      'SELECT status_id, status_name FROM status_detail WHERE status_id IN (1, 2) ORDER BY status_id'
    );
    statuses = res.rows;
  } catch (err: any) {
    console.error('Failed to load agent edit details:', err.message);
    redirect('/sf/setup/agents');
  }

  return <AgentEditForm record={record} statuses={statuses} />;
}
