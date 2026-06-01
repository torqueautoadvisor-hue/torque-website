'use server';

import { cookies } from 'next/headers';
import { db } from '../../lib/db';

async function getSessionUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) throw new Error('Unauthorized');
  return JSON.parse(session);
}

export async function createInquiryRecord(data: any) {
  try {
    const user = await getSessionUser();
    
    // Check permission (Module ID 3 check)
    const permissions = user.md_id ? user.md_id.split(',') : [];
    if (user.adm_type !== 0 && !permissions.includes('3')) {
      return { success: false, error: 'Permission denied.' };
    }

    const { inq_name, inq_contact, inq_address, inq_remarks, inq_status, inq_action, rej_res_id, inq_date } = data;

    if (!inq_name || !inq_contact) {
      return { success: false, error: 'Name and Mobile number are required.' };
    }

    // 1. Calculate next sequential code like INQ33
    const countRes = await db.query("SELECT COUNT(*) as count FROM inquiry_detail WHERE inq_code_no LIKE 'INQ%'");
    const totalCount = parseInt(countRes.rows[0].count);
    const inqCodeNo = `INQ${totalCount + 1}`;

    const branchId = user.branch_id || 1;
    const addedBy = user.adm_id;
    const addedDate = new Date().toISOString();

    const cleanDate = (dStr: string) => dStr && dStr.trim() !== '' ? dStr : null;

    // 2. Insert into inquiry_detail
    await db.query(
      `INSERT INTO inquiry_detail (
        branch_id, inq_code_no, inq_date, inq_name, inq_address, inq_contact, inq_remarks, 
        added_by, updated_by, inq_status, inq_action, rej_res_id, added_date, updated_date
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8, $9, $10, $11, $12, $12)`,
      [
        branchId,
        inqCodeNo,
        cleanDate(inq_date) || addedDate,
        inq_name,
        inq_address || '',
        inq_contact,
        inq_remarks || '',
        addedBy,
        parseInt(inq_status) || 1,
        inq_action || '1',
        parseInt(rej_res_id) || 0,
        addedDate
      ]
    );

    return { success: true, redirect: '/inquiries?flag=1' };

  } catch (err: any) {
    console.error('Failed to create inquiry record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function updateInquiryRecord(inqId: number, data: any) {
  try {
    const user = await getSessionUser();
    
    // Check permission (Module ID 3 check)
    const permissions = user.md_id ? user.md_id.split(',') : [];
    if (user.adm_type !== 0 && !permissions.includes('3')) {
      return { success: false, error: 'Permission denied.' };
    }

    const { inq_name, inq_contact, inq_address, inq_remarks, inq_status, inq_action, rej_res_id, inq_date } = data;

    if (!inq_name || !inq_contact) {
      return { success: false, error: 'Name and Mobile number are required.' };
    }

    const branchId = user.branch_id || 1;
    const updatedBy = user.adm_id;
    const updatedDate = new Date().toISOString();
    const cleanDate = (dStr: string) => dStr && dStr.trim() !== '' ? dStr : null;

    // Strict sub-admin checks: ensure sub-admins cannot edit records of other users
    let query = `UPDATE inquiry_detail 
                 SET inq_date = $1, inq_name = $2, inq_address = $3, inq_contact = $4, inq_remarks = $5, 
                     inq_status = $6, inq_action = $7, rej_res_id = $8, updated_by = $9, updated_date = $10 
                 WHERE inq_id = $11 AND branch_id = $12`;
    const queryParams = [
      cleanDate(inq_date) || updatedDate,
      inq_name,
      inq_address || '',
      inq_contact,
      inq_remarks || '',
      parseInt(inq_status) || 1,
      inq_action || '1',
      parseInt(rej_res_id) || 0,
      updatedBy,
      updatedDate,
      inqId,
      branchId
    ];

    if (user.adm_type !== 0) {
      queryParams.push(user.adm_id);
      query += ` AND added_by = $13`;
    }

    await db.query(query, queryParams);

    return { success: true, redirect: '/inquiries?flag=2' };

  } catch (err: any) {
    console.error('Failed to update inquiry record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function deleteInquiryRecord(inqId: number) {
  try {
    const user = await getSessionUser();
    
    // Master admin (type 0) is required to delete
    if (user.adm_type !== 0) {
      return { success: false, error: 'Permission denied. Master Admin required.' };
    }

    const updatedDate = new Date().toISOString();
    const updatedBy = user.adm_id;

    await db.query(
      `UPDATE inquiry_detail 
       SET inq_status = 3, updated_by = $1, updated_date = $2 
       WHERE inq_id = $3 AND branch_id = $4`,
      [updatedBy, updatedDate, inqId, user.branch_id]
    );

    return { success: true, redirect: '/inquiries?flag=3' };

  } catch (err: any) {
    console.error('Failed to delete inquiry record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function createInquiryFollowupAction(data: any) {
  try {
    const user = await getSessionUser();
    
    // Check permission (Module ID 3 check)
    const permissions = user.md_id ? user.md_id.split(',') : [];
    if (user.adm_type !== 0 && !permissions.includes('3')) {
      return { success: false, error: 'Permission denied.' };
    }

    const { inq_id, inqflp_date, inqflp_reminder_date, inqflp_notes } = data;

    if (!inq_id || !inqflp_date || !inqflp_notes) {
      return { success: false, error: 'Inquiry ID, date and notes are required.' };
    }

    const branchId = user.branch_id || 1;
    const addedBy = user.adm_id;
    const addedDate = new Date().toISOString();

    const cleanDate = (dStr: string) => dStr && dStr.trim() !== '' ? dStr : null;

    await db.query(
      `INSERT INTO inq_flp_detail (
        branch_id, inq_id, inqflp_date, inqflp_reminder_date, inqflp_notes, 
        added_by, updated_by, inqflp_status, added_date, updated_date
       ) VALUES ($1, $2, $3, $4, $5, $6, $6, 1, $7, $7)`,
      [
        branchId,
        parseInt(inq_id),
        cleanDate(inqflp_date) || addedDate,
        cleanDate(inqflp_reminder_date),
        inqflp_notes,
        addedBy,
        addedDate
      ]
    );

    return { success: true, redirect: `/inquiries/followup?inq_id=${inq_id}&flag=1` };

  } catch (err: any) {
    console.error('Failed to create inquiry followup:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}
