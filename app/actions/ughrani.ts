'use server';

import { cookies } from 'next/headers';
import { db } from '../../lib/db';

async function getSessionUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) throw new Error('Unauthorized');
  return JSON.parse(session);
}

function checkModulePermission(user: any) {
  const permissions = user.md_id ? user.md_id.split(',') : [];
  if (user.adm_type === 0) return true; // Master Admin bypass
  return permissions.includes('15'); // Module 15 for Ughrani logs
}

export async function createUghraniRecord(formData: FormData) {
  try {
    const user = await getSessionUser();
    if (!checkModulePermission(user)) {
      return { success: false, error: 'Permission denied.' };
    }

    const ughName = formData.get('ugh_name') as string;
    const ughContact = formData.get('ugh_contact') as string;
    const ughDescription = formData.get('ugh_description') as string || '';
    const ughAmount = formData.get('ugh_amount') as string;
    const ughDate = formData.get('ugh_date') as string;
    const ughDueDate = formData.get('ugh_due_date') as string;
    const ughActionStr = formData.get('ugh_action') as string || '1';
    const ughStatusStr = formData.get('ugh_status') as string || '1';

    if (!ughName || !ughContact || !ughAmount || !ughDueDate) {
      return { success: false, error: 'Name, Contact, Amount, and Due Date are required.' };
    }

    const branchId = user.branch_id || 1;
    const addedBy = user.adm_id;
    const addedDate = new Date().toISOString();
    const cleanDate = (dStr: string) => dStr && dStr.trim() !== '' ? dStr : null;

    // Generate sequential code: UGH{count+1}
    const countRes = await db.query("SELECT COUNT(*) as count FROM ughrani_detail WHERE ugh_code_no LIKE 'UGH%'");
    const totalCount = parseInt(countRes.rows[0].count) || 0;
    const ughCodeNo = `UGH${totalCount + 1}`;

    await db.query(
      `INSERT INTO ughrani_detail (
        branch_id, ugh_code_no, ugh_name, ugh_contact, ugh_descripiton, ugh_amount, ugh_date,
        ugh_due_date, ugh_action, added_by, updated_by, ugh_status, added_date, updated_date
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10, $11, $12, $12)`,
      [
        branchId,
        ughCodeNo,
        ughName,
        ughContact,
        ughDescription,
        ughAmount,
        cleanDate(ughDate) || addedDate,
        cleanDate(ughDueDate) || addedDate,
        parseInt(ughActionStr) || 1,
        addedBy,
        parseInt(ughStatusStr) || 1,
        addedDate
      ]
    );

    return { success: true, redirect: '/ughrani?flag=1' };

  } catch (err: any) {
    console.error('Failed to create Ughrani record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function updateUghraniRecord(ughId: number, formData: FormData) {
  try {
    const user = await getSessionUser();
    if (!checkModulePermission(user)) {
      return { success: false, error: 'Permission denied.' };
    }

    const ughName = formData.get('ugh_name') as string;
    const ughContact = formData.get('ugh_contact') as string;
    const ughDescription = formData.get('ugh_description') as string || '';
    const ughAmount = formData.get('ugh_amount') as string;
    const ughDate = formData.get('ugh_date') as string;
    const ughDueDate = formData.get('ugh_due_date') as string;
    const ughActionStr = formData.get('ugh_action') as string || '1';
    const ughStatusStr = formData.get('ugh_status') as string || '1';

    if (!ughName || !ughContact || !ughAmount || !ughDueDate) {
      return { success: false, error: 'Name, Contact, Amount, and Due Date are required.' };
    }

    const branchId = user.branch_id || 1;
    const updatedBy = user.adm_id;
    const updatedDate = new Date().toISOString();
    const cleanDate = (dStr: string) => dStr && dStr.trim() !== '' ? dStr : null;

    // Verify branch boundaries
    const checkRes = await db.query(
      'SELECT * FROM ughrani_detail WHERE ugh_id = $1 AND branch_id = $2 AND ugh_status != 3',
      [ughId, branchId]
    );
    if (checkRes.rowCount === 0) {
      return { success: false, error: 'Record not found or access denied.' };
    }

    await db.query(
      `UPDATE ughrani_detail 
       SET ugh_name = $1, ugh_contact = $2, ugh_descripiton = $3, ugh_amount = $4, ugh_date = $5,
           ugh_due_date = $6, ugh_action = $7, ugh_status = $8, updated_by = $9, updated_date = $10
       WHERE ugh_id = $11`,
      [
        ughName,
        ughContact,
        ughDescription,
        ughAmount,
        cleanDate(ughDate) || updatedDate,
        cleanDate(ughDueDate) || updatedDate,
        parseInt(ughActionStr) || 1,
        parseInt(ughStatusStr) || 1,
        updatedBy,
        updatedDate,
        ughId
      ]
    );

    return { success: true, redirect: '/ughrani?flag=2' };

  } catch (err: any) {
    console.error('Failed to update Ughrani record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function deleteUghraniRecord(ughId: number) {
  try {
    const user = await getSessionUser();
    if (user.adm_type !== 0) {
      return { success: false, error: 'Permission denied. Master Admin required.' };
    }

    const updatedDate = new Date().toISOString();
    const updatedBy = user.adm_id;

    await db.query(
      `UPDATE ughrani_detail 
       SET ugh_status = 3, updated_by = $1, updated_date = $2 
       WHERE ugh_id = $3 AND branch_id = $4`,
      [updatedBy, updatedDate, ughId, user.branch_id]
    );

    return { success: true, redirect: '/ughrani?flag=3' };

  } catch (err: any) {
    console.error('Failed to delete Ughrani record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}
