'use server';

import { cookies } from 'next/headers';
import { db } from '../../lib/db';

async function getSessionUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) throw new Error('Unauthorized');
  return JSON.parse(session);
}

export async function createRenewalRecord(data: any) {
  try {
    const user = await getSessionUser();
    
    // Check permission (Module ID 3 check)
    const permissions = user.md_id ? user.md_id.split(',') : [];
    if (user.adm_type !== 0 && !permissions.includes('3')) {
      return { success: false, error: 'Permission denied.' };
    }

    const {
      ren_series,
      ren_date,
      ren_reg_no,
      ren_name,
      ren_contact,
      ren_altcontact,
      ren_vmodel,
      ren_netprem,
      ren_totprem,
      ren_category,
      ren_fname,
      ren_address,
      ren_chassis,
      ren_engine,
      ren_insurance_date,
      ren_cf_date,
      ren_reg_date,
      ren_permit_date,
      ren_nat_permit_date,
      ren_tax_date,
      ren_qut_date,
      ren_remarks,
      ren_adm_id,
      ren_action,
      ren_status,
      rej_res_id
    } = data;

    if (!ren_reg_no || !ren_name || !ren_contact) {
      return { success: false, error: 'Registration No, Name, and Mobile No are required.' };
    }

    // Check duplicate: Gj and insurance_date
    const cleanDate = (dStr: string) => dStr && dStr.trim() !== '' ? dStr : null;
    const insDate = cleanDate(ren_insurance_date);

    if (insDate) {
      const dupRes = await db.query(
        "SELECT * FROM renewal_detail WHERE ren_reg_no = $1 AND ren_insurance_date = $2 AND ren_status != 3 AND ren_action != '3'",
        [ren_reg_no, insDate]
      );
      if (dupRes.rowCount && dupRes.rowCount >= 1) {
        return { success: false, error: 'This registration no. is already exists with this insurance date.' };
      }
    }

    // 1. Calculate next sequential code like REN24
    const countRes = await db.query("SELECT COUNT(*) as count FROM renewal_detail WHERE ren_code_no LIKE 'REN%'");
    const totalCount = parseInt(countRes.rows[0].count);
    const renCodeNo = `REN${totalCount + 1}`;

    const branchId = user.branch_id || 1;
    const addedBy = user.adm_id;
    const addedDate = new Date().toISOString();

    // 2. Insert record
    await db.query(
      `INSERT INTO renewal_detail (
        branch_id, ren_code_no, ren_series, ren_adm_id, ren_date, ren_name, ren_fname, ren_address,
        ren_chassis, ren_engine, ren_contact, ren_altcontact, ren_reg_no, ren_vmodel, ren_category,
        ren_netprem, ren_totprem, ren_insurance_date, ren_cf_date, ren_reg_date, ren_permit_date,
        ren_nat_permit_date, ren_tax_date, ren_qut_date, ren_remarks, added_by, updated_by,
        ren_status, ren_action, rej_res_id, added_date, updated_date
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $26, $27, $28, $29, $30, $30)`,
      [
        branchId,
        renCodeNo,
        ren_series || '',
        parseInt(ren_adm_id) || addedBy,
        cleanDate(ren_date) || addedDate,
        ren_name,
        ren_fname || '',
        ren_address || '',
        ren_chassis || '', // GVW
        ren_engine || '',  // Insurance Company
        ren_contact,
        ren_altcontact || '',
        ren_reg_no,
        ren_vmodel || '',
        ren_category || '',
        ren_netprem || '',
        ren_totprem || '',
        insDate,
        cleanDate(ren_cf_date),
        cleanDate(ren_reg_date),
        cleanDate(ren_permit_date),
        cleanDate(ren_nat_permit_date),
        cleanDate(ren_tax_date),
        cleanDate(ren_qut_date),
        ren_remarks || '',
        addedBy,
        parseInt(ren_status) || 1,
        ren_action || '1',
        parseInt(rej_res_id) || 0,
        addedDate
      ]
    );

    return { success: true, redirect: '/renewal?flag=1' };

  } catch (err: any) {
    console.error('Failed to create renewal record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function updateRenewalRecord(renId: number, data: any) {
  try {
    const user = await getSessionUser();
    
    // Check permission (Module ID 3 check)
    const permissions = user.md_id ? user.md_id.split(',') : [];
    if (user.adm_type !== 0 && !permissions.includes('3')) {
      return { success: false, error: 'Permission denied.' };
    }

    const {
      ren_series,
      ren_date,
      ren_reg_no,
      ren_name,
      ren_contact,
      ren_altcontact,
      ren_vmodel,
      ren_netprem,
      ren_totprem,
      ren_category,
      ren_fname,
      ren_address,
      ren_chassis,
      ren_engine,
      ren_insurance_date,
      ren_cf_date,
      ren_reg_date,
      ren_permit_date,
      ren_nat_permit_date,
      ren_tax_date,
      ren_qut_date,
      ren_remarks,
      ren_adm_id,
      ren_action,
      ren_status,
      rej_res_id
    } = data;

    if (!ren_reg_no || !ren_name || !ren_contact) {
      return { success: false, error: 'Registration No, Name, and Mobile No are required.' };
    }

    const branchId = user.branch_id || 1;
    const updatedBy = user.adm_id;
    const updatedDate = new Date().toISOString();
    const cleanDate = (dStr: string) => dStr && dStr.trim() !== '' ? dStr : null;

    // Strict sub-admin boundaries: make sure they only edit their own records if they are not Master Admin
    let accessCheckQuery = `SELECT * FROM renewal_detail WHERE ren_id = $1 AND branch_id = $2`;
    const checkParams = [renId, branchId];
    if (user.adm_type !== 0) {
      accessCheckQuery += ` AND ren_adm_id = $3`;
      checkParams.push(user.adm_id);
    }
    const checkRes = await db.query(accessCheckQuery, checkParams);
    if (checkRes.rowCount === 0) {
      return { success: false, error: 'Record not found or access denied.' };
    }

    // Update the renewal record
    await db.query(
      `UPDATE renewal_detail 
       SET ren_series = $1, ren_date = $2, ren_name = $3, ren_fname = $4, ren_address = $5,
           ren_chassis = $6, ren_engine = $7, ren_contact = $8, ren_altcontact = $9, ren_reg_no = $10,
           ren_vmodel = $11, ren_netprem = $12, ren_totprem = $13, ren_category = $14,
           ren_insurance_date = $15, ren_cf_date = $16, ren_reg_date = $17, ren_permit_date = $18,
           ren_nat_permit_date = $19, ren_tax_date = $20, ren_qut_date = $21, ren_remarks = $22,
           ren_adm_id = $23, ren_action = $24, rej_res_id = $25, ren_status = $26,
           updated_by = $27, updated_date = $28
       WHERE ren_id = $29`,
      [
        ren_series || '',
        cleanDate(ren_date) || updatedDate,
        ren_name,
        ren_fname || '',
        ren_address || '',
        ren_chassis || '', // GVW
        ren_engine || '',  // Insurance Company
        ren_contact,
        ren_altcontact || '',
        ren_reg_no,
        ren_vmodel || '',
        ren_netprem || '',
        ren_totprem || '',
        ren_category || '',
        cleanDate(ren_insurance_date),
        cleanDate(ren_cf_date),
        cleanDate(ren_reg_date),
        cleanDate(ren_permit_date),
        cleanDate(ren_nat_permit_date),
        cleanDate(ren_tax_date),
        cleanDate(ren_qut_date),
        ren_remarks || '',
        parseInt(ren_adm_id) || updatedBy,
        ren_action || '1',
        parseInt(rej_res_id) || 0,
        parseInt(ren_status) || 1,
        updatedBy,
        updatedDate,
        renId
      ]
    );

    return { success: true, redirect: '/renewal?flag=2' };

  } catch (err: any) {
    console.error('Failed to update renewal record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function deleteRenewalRecord(renId: number) {
  try {
    const user = await getSessionUser();
    
    // Master admin (type 0) required to delete
    if (user.adm_type !== 0) {
      return { success: false, error: 'Permission denied. Master Admin required.' };
    }

    const updatedDate = new Date().toISOString();
    const updatedBy = user.adm_id;

    await db.query(
      `UPDATE renewal_detail 
       SET ren_status = 3, updated_by = $1, updated_date = $2 
       WHERE ren_id = $3 AND branch_id = $4`,
      [updatedBy, updatedDate, renId, user.branch_id]
    );

    return { success: true, redirect: '/renewal?flag=3' };

  } catch (err: any) {
    console.error('Failed to delete renewal record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function bulkActionRenewalRecords(actionType: string, selectedIds: number[]) {
  try {
    const user = await getSessionUser();

    // Check permission (Module ID 3 check)
    const permissions = user.md_id ? user.md_id.split(',') : [];
    if (user.adm_type !== 0 && !permissions.includes('3')) {
      return { success: false, error: 'Permission denied.' };
    }

    if (!selectedIds || selectedIds.length === 0) {
      return { success: false, error: 'No items selected.' };
    }

    const updatedDate = new Date().toISOString();
    const updatedBy = user.adm_id;

    if (actionType === 'DELETE') {
      if (user.adm_type !== 0) {
        return { success: false, error: 'Only Master Admin can delete records.' };
      }

      await db.query(
        `UPDATE renewal_detail 
         SET ren_status = 3, updated_by = $1, updated_date = $2 
         WHERE ren_id = ANY($3) AND branch_id = $4`,
        [updatedBy, updatedDate, selectedIds, user.branch_id]
      );

      return { success: true, redirect: '/renewal?flag=6' };
    } else {
      const targetAdminId = parseInt(actionType);
      if (isNaN(targetAdminId)) {
        return { success: false, error: 'Invalid action selected.' };
      }

      await db.query(
        `UPDATE renewal_detail 
         SET ren_adm_id = $1, updated_by = $2, updated_date = $3 
         WHERE ren_id = ANY($4) AND branch_id = $5`,
        [targetAdminId, updatedBy, updatedDate, selectedIds, user.branch_id]
      );

      return { success: true, redirect: '/renewal?flag=4' };
    }
  } catch (err: any) {
    console.error('Bulk action failed for renewal logs:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function uploadRenewalDocumentAction(formData: FormData) {
  try {
    const user = await getSessionUser();
    const renIdStr = formData.get('ren_id') as string;
    const documentTitle = formData.get('document_title') as string || '';
    const file = formData.get('document_image') as File;

    if (!renIdStr || !file || file.size === 0) {
      return { success: false, error: 'Document file and Renewal ID are required.' };
    }

    const renId = parseInt(renIdStr);
    if (isNaN(renId)) {
      return { success: false, error: 'Invalid Renewal ID.' };
    }

    const validExtensions = ['jpg', 'png', 'jpeg', 'pdf'];
    const fileName = file.name;
    const fileExt = fileName.split('.').pop()?.toLowerCase() || '';

    if (!validExtensions.includes(fileExt)) {
      return { success: false, error: 'Invalid file extension. Please select JPG, PNG, or PDF.' };
    }

    // 1. Upload to Supabase Storage Bucket
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const ranFileName = `${timestamp}-${fileName}`;
    const filePath = `renewal-documents/${ranFileName}`;

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
      console.error('Supabase upload failed:', errText);
      return { success: false, error: 'Cloud file upload failed.' };
    }

    const fileUrl = `${supabaseUrl}/storage/v1/object/public/torque-vault/${filePath}`;
    const addedDate = new Date().toISOString();

    // 2. Insert into document_detail
    await db.query(
      `INSERT INTO document_detail (
        document_title, document_image, glb_id, tkn_id, rto_id, ren_id, clm_id, cus_id, gen_id, 
        added_by, updated_by, document_status, added_date, updated_date
       ) VALUES ($1, $2, 0, 0, 0, $3, 0, 0, 0, $4, $4, 1, $5, $5)`,
      [documentTitle || fileName, fileUrl, renId, user.adm_id, addedDate]
    );

    return { success: true, redirect: `/renewal/documents?ren_id=${renId}&flag=1` };

  } catch (err: any) {
    console.error('Upload document error for renewal logs:', err.message);
    return { success: false, error: err.message || 'File upload failed.' };
  }
}

export async function deleteRenewalDocumentAction(documentId: number, renId: number) {
  try {
    const user = await getSessionUser();

    // Check permission (Module ID 3 check)
    const permissions = user.md_id ? user.md_id.split(',') : [];
    if (user.adm_type !== 0 && !permissions.includes('3')) {
      return { success: false, error: 'Permission denied.' };
    }

    const updatedDate = new Date().toISOString();
    const updatedBy = user.adm_id;

    await db.query(
      `UPDATE document_detail 
       SET document_status = 3, updated_by = $1, updated_date = $2 
       WHERE document_id = $3 AND ren_id = $4`,
      [updatedBy, updatedDate, documentId, renId]
    );

    return { success: true, redirect: `/renewal/documents?ren_id=${renId}&flag=3` };

  } catch (err: any) {
    console.error('Failed to delete renewal document:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function createRenewalFollowupAction(data: any) {
  try {
    const user = await getSessionUser();
    
    // Check permission (Module ID 3 check)
    const permissions = user.md_id ? user.md_id.split(',') : [];
    if (user.adm_type !== 0 && !permissions.includes('3')) {
      return { success: false, error: 'Permission denied.' };
    }

    const { ren_id, renflp_date, renflp_reminder_date, renflp_notes } = data;

    if (!ren_id || !renflp_date || !renflp_notes) {
      return { success: false, error: 'Renewal ID, date and notes are required.' };
    }

    const branchId = user.branch_id || 1;
    const addedBy = user.adm_id;
    const addedDate = new Date().toISOString();

    const cleanDate = (dStr: string) => dStr && dStr.trim() !== '' ? dStr : null;

    await db.query(
      `INSERT INTO ren_flp_detail (
        branch_id, ren_id, renflp_date, renflp_reminder_date, renflp_notes, 
        added_by, updated_by, renflp_status, added_date, updated_date
       ) VALUES ($1, $2, $3, $4, $5, $6, $6, 1, $7, $7)`,
      [
        branchId,
        parseInt(ren_id),
        cleanDate(renflp_date) || addedDate,
        cleanDate(renflp_reminder_date),
        renflp_notes,
        addedBy,
        addedDate
      ]
    );

    return { success: true, redirect: `/renewal/followup?ren_id=${ren_id}&flag=1` };

  } catch (err: any) {
    console.error('Failed to create renewal followup:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}
