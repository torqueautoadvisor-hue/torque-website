'use server';

import { cookies } from 'next/headers';
import { db } from '../../lib/db';

async function getSessionUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) throw new Error('Unauthorized');
  return JSON.parse(session);
}

/**
 * Helper to upload files to Supabase torque-vault Storage bucket
 */
async function uploadToSupabaseBucket(file: File, folder: string) {
  if (!file || file.size === 0) return '';

  const validExtensions = ['jpg', 'png', 'jpeg', 'pdf'];
  const fileName = file.name;
  const fileExt = fileName.split('.').pop()?.toLowerCase() || '';

  if (!validExtensions.includes(fileExt)) {
    throw new Error('Invalid file format. Select JPG, PNG, or PDF.');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
  const cleanName = fileName.replace(/\s+/g, '');
  const ranFileName = `${timestamp}-${cleanName}`;
  const filePath = `${folder}/${ranFileName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadUrl = `${supabaseUrl}/storage/v1/object/torque-vault/${filePath}`;
  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: buffer,
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    console.error('Supabase finance upload failed:', errText);
    throw new Error('Cloud storage upload failed.');
  }

  return `${supabaseUrl}/storage/v1/object/public/torque-vault/${filePath}`;
}

// ==================== DAILY HISAB ACTIONS ====================

export async function createHisabRecord(formData: FormData) {
  try {
    const user = await getSessionUser();
    
    // Check permission (Module ID 9 check)
    const permissions = user.md_id ? user.md_id.split(',') : [];
    if (user.adm_type !== 0 && !permissions.includes('9')) {
      return { success: false, error: 'Permission denied.' };
    }

    const dateVal = formData.get('dl_hsb_date') as string;
    const incexpVal = formData.get('dl_hsb_incexp') as string;
    const pmIdVal = formData.get('pm_id') as string;
    const amountVal = formData.get('dl_hsb_amount') as string;
    const nameVal = formData.get('dl_hsb_name') as string || '';
    const regnoVal = formData.get('dl_hsb_regno') as string || '';
    const descriptionVal = formData.get('dl_hsb_description') as string || '';
    const statusVal = formData.get('dl_hsb_status') as string || '1';
    const file = formData.get('dl_hsb_image') as File;

    if (!dateVal || !incexpVal || !pmIdVal || !amountVal || !descriptionVal) {
      return { success: false, error: 'All asterisk marked fields are required.' };
    }

    // 1. Generate code DHXX
    const countRes = await db.query("SELECT COUNT(*) as count FROM daily_hisab_detail WHERE dl_hsb_code_no LIKE 'DH%'");
    const totalCount = parseInt(countRes.rows[0].count);
    const codeNo = `DH${totalCount + 1}`;

    // 2. Upload file if uploaded
    let imageUrl = '';
    if (file && file.size > 0) {
      imageUrl = await uploadToSupabaseBucket(file, 'daily-hisab');
    }

    const branchId = user.branch_id || 1;
    const addedBy = user.adm_id;
    const addedDate = new Date().toISOString();

    const cleanDate = (dStr: string) => dStr && dStr.trim() !== '' ? dStr : null;

    await db.query(
      `INSERT INTO daily_hisab_detail (
        branch_id, dl_hsb_code_no, dl_hsb_incexp, pm_id, dl_hsb_adm_id, dl_hsb_description, 
        dl_hsb_amount, dl_hsb_name, dl_hsb_regno, dl_hsb_date, dl_hsb_image, 
        added_by, updated_by, dl_hsb_status, added_date, updated_date
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12, $13, $14, $14)`,
      [
        branchId,
        codeNo,
        parseInt(incexpVal),
        parseInt(pmIdVal),
        addedBy,
        descriptionVal,
        parseFloat(amountVal),
        nameVal,
        regnoVal.toUpperCase().trim(),
        cleanDate(dateVal) || addedDate,
        imageUrl,
        addedBy,
        parseInt(statusVal),
        addedDate
      ]
    );

    return { success: true, redirect: '/daily-hisab?flag=1' };

  } catch (err: any) {
    console.error('Failed to create daily hisab:', err.message);
    return { success: false, error: err.message || 'Database transaction failed.' };
  }
}

export async function updateHisabRecord(hisabId: number, formData: FormData) {
  try {
    const user = await getSessionUser();
    
    // Check permission (Module ID 9 check)
    const permissions = user.md_id ? user.md_id.split(',') : [];
    if (user.adm_type !== 0 && !permissions.includes('9')) {
      return { success: false, error: 'Permission denied.' };
    }

    const dateVal = formData.get('dl_hsb_date') as string;
    const incexpVal = formData.get('dl_hsb_incexp') as string;
    const pmIdVal = formData.get('pm_id') as string;
    const amountVal = formData.get('dl_hsb_amount') as string;
    const nameVal = formData.get('dl_hsb_name') as string || '';
    const regnoVal = formData.get('dl_hsb_regno') as string || '';
    const descriptionVal = formData.get('dl_hsb_description') as string || '';
    const statusVal = formData.get('dl_hsb_status') as string || '1';
    const file = formData.get('dl_hsb_image') as File;

    if (!dateVal || !incexpVal || !pmIdVal || !amountVal || !descriptionVal) {
      return { success: false, error: 'All asterisk marked fields are required.' };
    }

    const branchId = user.branch_id || 1;
    const updatedBy = user.adm_id;
    const updatedDate = new Date().toISOString();
    const cleanDate = (dStr: string) => dStr && dStr.trim() !== '' ? dStr : null;

    let imageUrl = '';
    if (file && file.size > 0) {
      imageUrl = await uploadToSupabaseBucket(file, 'daily-hisab');
    }

    // Prepare update parameters
    let updateQuery = `UPDATE daily_hisab_detail 
                       SET dl_hsb_date = $1, dl_hsb_incexp = $2, pm_id = $3, dl_hsb_amount = $4, 
                           dl_hsb_name = $5, dl_hsb_regno = $6, dl_hsb_description = $7, 
                           dl_hsb_status = $8, updated_by = $9, updated_date = $10`;
    const queryParams: any[] = [
      cleanDate(dateVal) || updatedDate,
      parseInt(incexpVal),
      parseInt(pmIdVal),
      parseFloat(amountVal),
      nameVal,
      regnoVal.toUpperCase().trim(),
      descriptionVal,
      parseInt(statusVal),
      updatedBy,
      updatedDate
    ];

    if (imageUrl) {
      queryParams.push(imageUrl);
      updateQuery += `, dl_hsb_image = $${queryParams.length}`;
    }

    queryParams.push(hisabId, branchId);
    updateQuery += ` WHERE dl_hsb_id = $${queryParams.length - 1} AND branch_id = $${queryParams.length}`;

    // Sub-admins check
    if (user.adm_type !== 0) {
      queryParams.push(user.adm_id);
      updateQuery += ` AND dl_hsb_adm_id = $${queryParams.length}`;
    }

    await db.query(updateQuery, queryParams);

    return { success: true, redirect: '/daily-hisab?flag=2' };

  } catch (err: any) {
    console.error('Failed to update daily hisab:', err.message);
    return { success: false, error: err.message || 'Database transaction failed.' };
  }
}

export async function deleteHisabRecord(hisabId: number) {
  try {
    const user = await getSessionUser();
    if (user.adm_type !== 0) return { success: false, error: 'Unauthorized.' };

    const updatedDate = new Date().toISOString();

    await db.query(
      `UPDATE daily_hisab_detail
       SET dl_hsb_status = 3, updated_by = $1, updated_date = $2
       WHERE dl_hsb_id = $3 AND branch_id = $4`,
      [user.adm_id, updatedDate, hisabId, user.branch_id]
    );

    return { success: true, redirect: '/daily-hisab?flag=3' };
  } catch (err: any) {
    console.error('Failed to delete daily hisab:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

// ==================== OFFICE EXPENSES ACTIONS ====================

export async function createExpenseRecord(formData: FormData) {
  try {
    const user = await getSessionUser();
    
    // Check permission (Module ID 10 check)
    const permissions = user.md_id ? user.md_id.split(',') : [];
    if (user.adm_type !== 0 && !permissions.includes('10')) {
      return { success: false, error: 'Permission denied.' };
    }

    const dateVal = formData.get('oexp_date') as string;
    const pmIdVal = formData.get('pm_id') as string;
    const amountVal = formData.get('oexp_amount') as string;
    const paidtoVal = formData.get('oexp_paidto') as string || '';
    const descriptionVal = formData.get('oexp_description') as string || '';
    const statusVal = formData.get('oexp_status') as string || '1';
    const file = formData.get('oexp_image') as File;

    if (!dateVal || !pmIdVal || !amountVal || !descriptionVal) {
      return { success: false, error: 'All asterisk marked fields are required.' };
    }

    // 1. Generate code OEXX
    const countRes = await db.query("SELECT COUNT(*) as count FROM office_expenses_detail WHERE oexp_code_no LIKE 'OE%'");
    const totalCount = parseInt(countRes.rows[0].count);
    const codeNo = `OE${totalCount + 1}`;

    // 2. Upload file if uploaded
    let imageUrl = '';
    if (file && file.size > 0) {
      imageUrl = await uploadToSupabaseBucket(file, 'office-expenses');
    }

    const branchId = user.branch_id || 1;
    const addedBy = user.adm_id;
    const addedDate = new Date().toISOString();

    const cleanDate = (dStr: string) => dStr && dStr.trim() !== '' ? dStr : null;

    await db.query(
      `INSERT INTO office_expenses_detail (
        branch_id, oexp_code_no, oexp_incexp, pm_id, oexp_adm_id, oexp_description, 
        oexp_amount, oexp_paidto, oexp_date, oexp_image, 
        added_by, updated_by, oexp_status, added_date, updated_date
       ) VALUES ($1, $2, 2, $3, $4, $5, $6, $7, $8, $9, $10, $10, $11, $12, $12)`,
      [
        branchId,
        codeNo,
        parseInt(pmIdVal),
        addedBy,
        descriptionVal,
        parseFloat(amountVal),
        paidtoVal,
        cleanDate(dateVal) || addedDate,
        imageUrl,
        addedBy,
        parseInt(statusVal),
        addedDate
      ]
    );

    return { success: true, redirect: '/expenses?flag=1' };

  } catch (err: any) {
    console.error('Failed to create office expense:', err.message);
    return { success: false, error: err.message || 'Database transaction failed.' };
  }
}

export async function updateExpenseRecord(expenseId: number, formData: FormData) {
  try {
    const user = await getSessionUser();
    
    // Check permission (Module ID 10 check)
    const permissions = user.md_id ? user.md_id.split(',') : [];
    if (user.adm_type !== 0 && !permissions.includes('10')) {
      return { success: false, error: 'Permission denied.' };
    }

    const dateVal = formData.get('oexp_date') as string;
    const pmIdVal = formData.get('pm_id') as string;
    const amountVal = formData.get('oexp_amount') as string;
    const paidtoVal = formData.get('oexp_paidto') as string || '';
    const descriptionVal = formData.get('oexp_description') as string || '';
    const statusVal = formData.get('oexp_status') as string || '1';
    const file = formData.get('oexp_image') as File;

    if (!dateVal || !pmIdVal || !amountVal || !descriptionVal) {
      return { success: false, error: 'All asterisk marked fields are required.' };
    }

    const branchId = user.branch_id || 1;
    const updatedBy = user.adm_id;
    const updatedDate = new Date().toISOString();
    const cleanDate = (dStr: string) => dStr && dStr.trim() !== '' ? dStr : null;

    let imageUrl = '';
    if (file && file.size > 0) {
      imageUrl = await uploadToSupabaseBucket(file, 'office-expenses');
    }

    let updateQuery = `UPDATE office_expenses_detail 
                       SET oexp_date = $1, pm_id = $2, oexp_amount = $3, oexp_paidto = $4, 
                           oexp_description = $5, oexp_status = $6, updated_by = $7, updated_date = $8`;
    const queryParams: any[] = [
      cleanDate(dateVal) || updatedDate,
      parseInt(pmIdVal),
      parseFloat(amountVal),
      paidtoVal,
      descriptionVal,
      parseInt(statusVal),
      updatedBy,
      updatedDate
    ];

    if (imageUrl) {
      queryParams.push(imageUrl);
      updateQuery += `, oexp_image = $${queryParams.length}`;
    }

    queryParams.push(expenseId, branchId);
    updateQuery += ` WHERE oexp_id = $${queryParams.length - 1} AND branch_id = $${queryParams.length}`;

    // Sub-admins check
    if (user.adm_type !== 0) {
      queryParams.push(user.adm_id);
      updateQuery += ` AND oexp_adm_id = $${queryParams.length}`;
    }

    await db.query(updateQuery, queryParams);

    return { success: true, redirect: '/expenses?flag=2' };

  } catch (err: any) {
    console.error('Failed to update office expense:', err.message);
    return { success: false, error: err.message || 'Database transaction failed.' };
  }
}

export async function deleteExpenseRecord(expenseId: number) {
  try {
    const user = await getSessionUser();
    if (user.adm_type !== 0) return { success: false, error: 'Unauthorized.' };

    const updatedDate = new Date().toISOString();

    await db.query(
      `UPDATE office_expenses_detail
       SET oexp_status = 3, updated_by = $1, updated_date = $2
       WHERE oexp_id = $3 AND branch_id = $4`,
      [user.adm_id, updatedDate, expenseId, user.branch_id]
    );

    return { success: true, redirect: '/expenses?flag=3' };
  } catch (err: any) {
    console.error('Failed to delete office expense:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}
