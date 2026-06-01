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
  return permissions.includes('13'); // Module 13 for Cheque logs
}

export async function createChequeRecord(formData: FormData) {
  try {
    const user = await getSessionUser();
    if (!checkModulePermission(user)) {
      return { success: false, error: 'Permission denied.' };
    }

    const chqRegno = formData.get('chq_regno') as string;
    const chqNo = formData.get('chq_no') as string;
    const chqAmount = formData.get('chq_amount') as string;
    const chqDate = formData.get('chq_date') as string;
    const chqBank = formData.get('chq_bank') as string;
    const chqDcActionStr = formData.get('chq_dc_action') as string || '0';
    const chqCourDet = formData.get('chq_cour_det') as string || '';
    const chqDcDate = formData.get('chq_dc_date') as string;
    const chqCshbAmt = formData.get('chq_cshb_amt') as string || '0';
    const chqCshbActionStr = formData.get('chq_cshb_action') as string || '0';
    const chqActionStr = formData.get('chq_action') as string || '1';
    const chqStatusStr = formData.get('chq_status') as string || '1';

    if (!chqRegno || !chqNo || !chqAmount || !chqBank) {
      return { success: false, error: 'All fields marked with an asterisk are required.' };
    }

    const branchId = user.branch_id || 1;
    const addedBy = user.adm_id;
    const addedDate = new Date().toISOString();
    const cleanDate = (dStr: string) => dStr && dStr.trim() !== '' ? dStr : null;

    // Generate sequential code: CHQ{count+1}
    const countRes = await db.query("SELECT COUNT(*) as count FROM cheque_detail WHERE chq_code_no LIKE 'CHQ%'");
    const totalCount = parseInt(countRes.rows[0].count) || 0;
    const chqCodeNo = `CHQ${totalCount + 1}`;

    await db.query(
      `INSERT INTO cheque_detail (
        branch_id, chq_code_no, chq_regno, chq_no, chq_amount, chq_date, chq_bank, chq_dc_action,
        chq_cour_det, chq_dc_date, chq_cshb_amt, chq_cshb_action, chq_action, added_by, updated_by,
        chq_status, added_date, updated_date
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $14, $15, $16, $16)`,
      [
        branchId,
        chqCodeNo,
        chqRegno,
        chqNo,
        chqAmount,
        cleanDate(chqDate) || addedDate,
        chqBank,
        parseInt(chqDcActionStr) || 0,
        chqCourDet,
        cleanDate(chqDcDate) || addedDate,
        chqCshbAmt,
        parseInt(chqCshbActionStr) || 0,
        parseInt(chqActionStr) || 1,
        addedBy,
        parseInt(chqStatusStr) || 1,
        addedDate
      ]
    );

    return { success: true, redirect: '/cheque?flag=1' };

  } catch (err: any) {
    console.error('Failed to create Cheque record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function updateChequeRecord(chqId: number, formData: FormData) {
  try {
    const user = await getSessionUser();
    if (!checkModulePermission(user)) {
      return { success: false, error: 'Permission denied.' };
    }

    const chqRegno = formData.get('chq_regno') as string;
    const chqNo = formData.get('chq_no') as string;
    const chqAmount = formData.get('chq_amount') as string;
    const chqDate = formData.get('chq_date') as string;
    const chqBank = formData.get('chq_bank') as string;
    const chqDcActionStr = formData.get('chq_dc_action') as string || '0';
    const chqCourDet = formData.get('chq_cour_det') as string || '';
    const chqDcDate = formData.get('chq_dc_date') as string;
    const chqCshbAmt = formData.get('chq_cshb_amt') as string || '0';
    const chqCshbActionStr = formData.get('chq_cshb_action') as string || '0';
    const chqActionStr = formData.get('chq_action') as string || '1';
    const chqStatusStr = formData.get('chq_status') as string || '1';

    if (!chqRegno || !chqNo || !chqAmount || !chqBank) {
      return { success: false, error: 'All fields marked with an asterisk are required.' };
    }

    const branchId = user.branch_id || 1;
    const updatedBy = user.adm_id;
    const updatedDate = new Date().toISOString();
    const cleanDate = (dStr: string) => dStr && dStr.trim() !== '' ? dStr : null;

    // Verify branch boundaries
    const checkRes = await db.query(
      'SELECT * FROM cheque_detail WHERE chq_id = $1 AND branch_id = $2 AND chq_status != 3',
      [chqId, branchId]
    );
    if (checkRes.rowCount === 0) {
      return { success: false, error: 'Record not found or access denied.' };
    }

    await db.query(
      `UPDATE cheque_detail 
       SET chq_regno = $1, chq_no = $2, chq_amount = $3, chq_date = $4, chq_bank = $5,
           chq_dc_action = $6, chq_cour_det = $7, chq_dc_date = $8, chq_cshb_amt = $9,
           chq_cshb_action = $10, chq_action = $11, chq_status = $12, updated_by = $13,
           updated_date = $14
       WHERE chq_id = $15`,
      [
        chqRegno,
        chqNo,
        chqAmount,
        cleanDate(chqDate) || updatedDate,
        chqBank,
        parseInt(chqDcActionStr) || 0,
        chqCourDet,
        cleanDate(chqDcDate) || updatedDate,
        chqCshbAmt,
        parseInt(chqCshbActionStr) || 0,
        parseInt(chqActionStr) || 1,
        parseInt(chqStatusStr) || 1,
        updatedBy,
        updatedDate,
        chqId
      ]
    );

    return { success: true, redirect: '/cheque?flag=2' };

  } catch (err: any) {
    console.error('Failed to update Cheque record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function deleteChequeRecord(chqId: number) {
  try {
    const user = await getSessionUser();
    if (user.adm_type !== 0) {
      return { success: false, error: 'Permission denied. Master Admin required.' };
    }

    const updatedDate = new Date().toISOString();
    const updatedBy = user.adm_id;

    await db.query(
      `UPDATE cheque_detail 
       SET chq_status = 3, updated_by = $1, updated_date = $2 
       WHERE chq_id = $3 AND branch_id = $4`,
      [updatedBy, updatedDate, chqId, user.branch_id]
    );

    return { success: true, redirect: '/cheque?flag=3' };

  } catch (err: any) {
    console.error('Failed to delete Cheque record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}
