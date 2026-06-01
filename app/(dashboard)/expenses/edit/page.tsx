import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../../../lib/db';
import ExpenseEditForm from './ExpenseEditForm';

export default async function ExpensesEditPage({
  searchParams,
}: {
  searchParams: Promise<{
    oexp_id?: string;
  }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    redirect('/');
  }

  const user = JSON.parse(session);
  const branchId = user.branch_id || 1;
  const isAdmin = user.adm_type === 0;

  // Check permissions (Module ID 10 check)
  const permissions = user.md_id ? user.md_id.split(',') : [];
  if (user.adm_type !== 0 && !permissions.includes('10')) {
    redirect('/insurance');
  }

  const params = await searchParams;
  const expenseIdStr = params.oexp_id;
  if (!expenseIdStr) {
    redirect('/expenses');
  }

  const expenseId = parseInt(expenseIdStr);
  if (isNaN(expenseId)) {
    redirect('/expenses');
  }

  let record: any = null;
  let paymentMethods: any[] = [];
  let statusList: any[] = [];

  try {
    // 1. Fetch active expense record
    let query = 'SELECT * FROM office_expenses_detail WHERE oexp_id = $1 AND branch_id = $2 AND oexp_status != 3';
    const queryParams: any[] = [expenseId, branchId];

    if (!isAdmin) {
      queryParams.push(user.adm_id);
      query += ` AND oexp_adm_id = $3`;
    }

    const recRes = await db.query(query, queryParams);
    if (recRes.rows.length === 0) {
      redirect('/expenses');
    }
    record = recRes.rows[0];

    // 2. Fetch payment methods
    const pmRes = await db.query(
      'SELECT pm_id, pm_name FROM pay_method_detail WHERE pm_status = 1 ORDER BY pm_id'
    );
    paymentMethods = pmRes.rows;

    // 3. Fetch statuses
    const statusRes = await db.query(
      'SELECT status_id, status_name FROM status_detail WHERE status_id IN (1, 2) ORDER BY status_id'
    );
    statusList = statusRes.rows;

  } catch (err: any) {
    console.error('Failed to load office expense edit parameters:', err.message);
    redirect('/expenses');
  }

  return (
    <ExpenseEditForm
      record={record}
      paymentMethods={paymentMethods}
      statusList={statusList}
    />
  );
}
