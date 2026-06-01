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
  return permissions.includes('14'); // Module 14 for Salary logs
}

export async function createSalaryRecord(formData: FormData) {
  try {
    const user = await getSessionUser();
    if (!checkModulePermission(user)) {
      return { success: false, error: 'Permission denied.' };
    }

    const admIdStr = formData.get('adm_id') as string;
    const slrFixStr = formData.get('slr_fix') as string || '0';
    const slrPaidStr = formData.get('slr_paid') as string || '0';
    const slrDedStr = formData.get('slr_ded') as string || '0';
    const slrPreStr = formData.get('slr_pre') as string || '0';
    const slrAbsStr = formData.get('slr_abs') as string || '0';
    const slrDate = formData.get('slr_date') as string;
    const slrStatusStr = formData.get('slr_status') as string || '1';

    if (!admIdStr || !slrDate) {
      return { success: false, error: 'Staff member selection and Salary Date are required.' };
    }

    const admId = parseInt(admIdStr);
    const slrFix = parseFloat(slrFixStr) || 0;
    const slrPaid = parseFloat(slrPaidStr) || 0;
    const slrDed = parseFloat(slrDedStr) || 0;
    const slrPre = parseFloat(slrPreStr) || 0;
    const slrAbs = parseFloat(slrAbsStr) || 0;

    const branchId = user.branch_id || 1;
    const addedBy = user.adm_id;
    const addedDate = new Date().toISOString();
    const cleanDate = (dStr: string) => dStr && dStr.trim() !== '' ? dStr : null;

    // Generate sequential code: SLR{count+1}
    const countRes = await db.query("SELECT COUNT(*) as count FROM salary_detail WHERE slr_code_no LIKE 'SLR%'");
    const totalCount = parseInt(countRes.rows[0].count) || 0;
    const slrCodeNo = `SLR${totalCount + 1}`;

    await db.query(
      `INSERT INTO salary_detail (
        branch_id, slr_code_no, adm_id, slr_fix, slr_paid, slr_ded, slr_pre, slr_abs, slr_date,
        added_by, updated_by, slr_status, added_date, updated_date
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10, $11, $12, $12)`,
      [
        branchId,
        slrCodeNo,
        admId,
        slrFix,
        slrPaid,
        slrDed,
        slrPre,
        slrAbs,
        cleanDate(slrDate) || addedDate,
        addedBy,
        parseInt(slrStatusStr) || 1,
        addedDate
      ]
    );

    return { success: true, redirect: '/salary?flag=1' };

  } catch (err: any) {
    console.error('Failed to create Salary record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function updateSalaryRecord(slrId: number, formData: FormData) {
  try {
    const user = await getSessionUser();
    if (!checkModulePermission(user)) {
      return { success: false, error: 'Permission denied.' };
    }

    const admIdStr = formData.get('adm_id') as string;
    const slrFixStr = formData.get('slr_fix') as string || '0';
    const slrPaidStr = formData.get('slr_paid') as string || '0';
    const slrDedStr = formData.get('slr_ded') as string || '0';
    const slrPreStr = formData.get('slr_pre') as string || '0';
    const slrAbsStr = formData.get('slr_abs') as string || '0';
    const slrDate = formData.get('slr_date') as string;
    const slrStatusStr = formData.get('slr_status') as string || '1';

    if (!admIdStr || !slrDate) {
      return { success: false, error: 'Staff member selection and Salary Date are required.' };
    }

    const admId = parseInt(admIdStr);
    const slrFix = parseFloat(slrFixStr) || 0;
    const slrPaid = parseFloat(slrPaidStr) || 0;
    const slrDed = parseFloat(slrDedStr) || 0;
    const slrPre = parseFloat(slrPreStr) || 0;
    const slrAbs = parseFloat(slrAbsStr) || 0;

    const branchId = user.branch_id || 1;
    const updatedBy = user.adm_id;
    const updatedDate = new Date().toISOString();
    const cleanDate = (dStr: string) => dStr && dStr.trim() !== '' ? dStr : null;

    // Verify branch boundaries
    const checkRes = await db.query(
      'SELECT * FROM salary_detail WHERE slr_id = $1 AND branch_id = $2 AND slr_status != 3',
      [slrId, branchId]
    );
    if (checkRes.rowCount === 0) {
      return { success: false, error: 'Record not found or access denied.' };
    }

    await db.query(
      `UPDATE salary_detail 
       SET adm_id = $1, slr_fix = $2, slr_paid = $3, slr_ded = $4, slr_pre = $5,
           slr_abs = $6, slr_date = $7, slr_status = $8, updated_by = $9, updated_date = $10
       WHERE slr_id = $11`,
      [
        admId,
        slrFix,
        slrPaid,
        slrDed,
        slrPre,
        slrAbs,
        cleanDate(slrDate) || updatedDate,
        parseInt(slrStatusStr) || 1,
        updatedBy,
        updatedDate,
        slrId
      ]
    );

    return { success: true, redirect: '/salary?flag=2' };

  } catch (err: any) {
    console.error('Failed to update Salary record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function deleteSalaryRecord(slrId: number) {
  try {
    const user = await getSessionUser();
    if (user.adm_type !== 0) {
      return { success: false, error: 'Permission denied. Master Admin required.' };
    }

    const updatedDate = new Date().toISOString();
    const updatedBy = user.adm_id;

    await db.query(
      `UPDATE salary_detail 
       SET slr_status = 3, updated_by = $1, updated_date = $2 
       WHERE slr_id = $3 AND branch_id = $4`,
      [updatedBy, updatedDate, slrId, user.branch_id]
    );

    return { success: true, redirect: '/salary?flag=3' };

  } catch (err: any) {
    console.error('Failed to delete Salary record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}
