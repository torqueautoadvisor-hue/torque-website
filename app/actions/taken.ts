'use server';

import { cookies } from 'next/headers';
import { db } from '../../lib/db';

async function getSessionUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) throw new Error('Unauthorized');
  return JSON.parse(session);
}

export async function createTakenRecord(data: any) {
  try {
    const user = await getSessionUser();
    
    // Check permission (Module ID 3 check)
    const permissions = user.md_id ? user.md_id.split(',') : [];
    if (user.adm_type !== 0 && !permissions.includes('3')) {
      return { success: false, error: 'Permission denied.' };
    }

    const {
      tkn_series,
      tkn_date,
      tkn_reg_no,
      tkn_name,
      tkn_contact,
      tkn_altcontact,
      tkn_vmodel,
      tkn_category,
      tkn_fname,
      tkn_address,
      tkn_chassis,
      tkn_engine,
      tkn_insurance_date,
      tkn_cf_date,
      tkn_reg_date,
      tkn_permit_date,
      tkn_nat_permit_date,
      tkn_tax_date,
      tkn_qut_date,
      tkn_remarks,
      tkn_adm_id,
      tkn_action,
      tkn_status,
      rej_res_id
    } = data;

    if (!tkn_reg_no || !tkn_name || !tkn_contact) {
      return { success: false, error: 'Registration No, Name, and Mobile No are required.' };
    }

    // Check duplicate: GJ01CV0267 and insurance_date
    const cleanDate = (dStr: string) => dStr && dStr.trim() !== '' ? dStr : null;
    const insDate = cleanDate(tkn_insurance_date);

    if (insDate) {
      const dupRes = await db.query(
        "SELECT * FROM taken_detail WHERE tkn_reg_no = $1 AND tkn_insurance_date = $2 AND tkn_status != 3 AND tkn_action != '3'",
        [tkn_reg_no, insDate]
      );
      if (dupRes.rowCount && dupRes.rowCount >= 1) {
        return { success: false, error: 'This registration no. is already exists with this insurance date.' };
      }
    }

    // 1. Calculate next sequential code like TKN44
    const countRes = await db.query("SELECT COUNT(*) as count FROM taken_detail WHERE tkn_code_no LIKE 'TKN%'");
    const totalCount = parseInt(countRes.rows[0].count);
    const tknCodeNo = `TKN${totalCount + 1}`;

    const branchId = user.branch_id || 1;
    const addedBy = user.adm_id;
    const addedDate = new Date().toISOString();

    // 2. Insert record
    await db.query(
      `INSERT INTO taken_detail (
        branch_id, tkn_code_no, tkn_series, tkn_adm_id, tkn_date, tkn_name, tkn_fname, tkn_address,
        tkn_chassis, tkn_engine, tkn_contact, tkn_altcontact, tkn_reg_no, tkn_vmodel, tkn_category,
        tkn_insurance_date, tkn_cf_date, tkn_reg_date, tkn_permit_date, tkn_nat_permit_date, tkn_tax_date,
        tkn_qut_date, tkn_remarks, added_by, updated_by, tkn_status, tkn_action, rej_res_id, added_date, updated_date
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $24, $25, $26, $27, $28, $28)`,
      [
        branchId,
        tknCodeNo,
        tkn_series || '',
        parseInt(tkn_adm_id) || addedBy,
        cleanDate(tkn_date) || addedDate,
        tkn_name,
        tkn_fname || '',
        tkn_address || '',
        tkn_chassis || '', // GVW
        tkn_engine || '',  // Insurance Company
        tkn_contact,
        tkn_altcontact || '',
        tkn_reg_no,
        tkn_vmodel || '',
        tkn_category || '',
        insDate,
        cleanDate(tkn_cf_date),
        cleanDate(tkn_reg_date),
        cleanDate(tkn_permit_date),
        cleanDate(tkn_nat_permit_date),
        cleanDate(tkn_tax_date),
        cleanDate(tkn_qut_date),
        tkn_remarks || '',
        addedBy,
        parseInt(tkn_status) || 1,
        tkn_action || '1',
        parseInt(rej_res_id) || 0,
        addedDate
      ]
    );

    return { success: true, redirect: '/taken?flag=1' };

  } catch (err: any) {
    console.error('Failed to create taken record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function updateTakenRecord(tknId: number, data: any) {
  try {
    const user = await getSessionUser();
    
    // Check permission (Module ID 3 check)
    const permissions = user.md_id ? user.md_id.split(',') : [];
    if (user.adm_type !== 0 && !permissions.includes('3')) {
      return { success: false, error: 'Permission denied.' };
    }

    const {
      tkn_series,
      tkn_date,
      tkn_reg_no,
      tkn_name,
      tkn_contact,
      tkn_altcontact,
      tkn_vmodel,
      tkn_category,
      tkn_fname,
      tkn_address,
      tkn_chassis,
      tkn_engine,
      tkn_insurance_date,
      tkn_cf_date,
      tkn_reg_date,
      tkn_permit_date,
      tkn_nat_permit_date,
      tkn_tax_date,
      tkn_qut_date,
      tkn_remarks,
      tkn_adm_id,
      tkn_action,
      tkn_status,
      rej_res_id
    } = data;

    if (!tkn_reg_no || !tkn_name || !tkn_contact) {
      return { success: false, error: 'Registration No, Name, and Mobile No are required.' };
    }

    const branchId = user.branch_id || 1;
    const updatedBy = user.adm_id;
    const updatedDate = new Date().toISOString();
    const cleanDate = (dStr: string) => dStr && dStr.trim() !== '' ? dStr : null;

    // Strict sub-admin boundaries: make sure they only edit their own records if they are not Master Admin
    let accessCheckQuery = `SELECT * FROM taken_detail WHERE tkn_id = $1 AND branch_id = $2`;
    const checkParams = [tknId, branchId];
    if (user.adm_type !== 0) {
      accessCheckQuery += ` AND tkn_adm_id = $3`;
      checkParams.push(user.adm_id);
    }
    const checkRes = await db.query(accessCheckQuery, checkParams);
    if (checkRes.rowCount === 0) {
      return { success: false, error: 'Record not found or access denied.' };
    }

    // 1. Update the taken record
    await db.query(
      `UPDATE taken_detail 
       SET tkn_series = $1, tkn_date = $2, tkn_name = $3, tkn_fname = $4, tkn_address = $5,
           tkn_chassis = $6, tkn_engine = $7, tkn_contact = $8, tkn_altcontact = $9, tkn_reg_no = $10,
           tkn_vmodel = $11, tkn_category = $12, tkn_insurance_date = $13, tkn_cf_date = $14,
           tkn_reg_date = $15, tkn_permit_date = $16, tkn_nat_permit_date = $17, tkn_tax_date = $18,
           tkn_qut_date = $19, tkn_remarks = $20, tkn_adm_id = $21, tkn_action = $22,
           rej_res_id = $23, tkn_status = $24, updated_by = $25, updated_date = $26
       WHERE tkn_id = $27`,
      [
        tkn_series || '',
        cleanDate(tkn_date) || updatedDate,
        tkn_name,
        tkn_fname || '',
        tkn_address || '',
        tkn_chassis || '', // GVW
        tkn_engine || '',  // Insurance Company
        tkn_contact,
        tkn_altcontact || '',
        tkn_reg_no,
        tkn_vmodel || '',
        tkn_category || '',
        cleanDate(tkn_insurance_date),
        cleanDate(tkn_cf_date),
        cleanDate(tkn_reg_date),
        cleanDate(tkn_permit_date),
        cleanDate(tkn_nat_permit_date),
        cleanDate(tkn_tax_date),
        cleanDate(tkn_qut_date),
        tkn_remarks || '',
        parseInt(tkn_adm_id) || updatedBy,
        tkn_action || '1',
        parseInt(rej_res_id) || 0,
        parseInt(tkn_status) || 1,
        updatedBy,
        updatedDate,
        tknId
      ]
    );

    // 2. Clone Side-Effect: If Action is Completed (tkn_action = '3')
    if (tkn_action === '3') {
      const insDate = cleanDate(tkn_insurance_date);

      // Check for duplication in renewal_detail
      const dupRenRes = await db.query(
        `SELECT * FROM renewal_detail 
         WHERE ren_reg_no = $1 AND ren_insurance_date = $2 AND ren_status != 3 AND ren_action != '3'`,
        [tkn_reg_no, insDate]
      );

      let targetRenId = 0;

      if (dupRenRes.rowCount && dupRenRes.rowCount >= 1) {
        // Duplicate renewal exists: update it
        const existingRen = dupRenRes.rows[0];
        targetRenId = existingRen.ren_id;

        await db.query(
          `UPDATE renewal_detail
           SET ren_adm_id = $1, ren_date = $2, ren_name = $3, ren_series = $4, ren_fname = $5,
               ren_address = $6, ren_chassis = $7, ren_engine = $8, ren_contact = $9, ren_altcontact = $10,
               ren_category = $11, ren_reg_no = $12, ren_vmodel = $13, ren_insurance_date = $14,
               ren_cf_date = $15, ren_reg_date = $16, ren_permit_date = $17, ren_nat_permit_date = $18,
               ren_tax_date = $19, ren_qut_date = $20, ren_remarks = $21, updated_by = $22, updated_date = $23
           WHERE ren_id = $24`,
          [
            parseInt(tkn_adm_id) || updatedBy,
            cleanDate(tkn_date) || updatedDate,
            tkn_name,
            tkn_series || '',
            tkn_fname || '',
            tkn_address || '',
            tkn_chassis || '',
            tkn_engine || '',
            tkn_contact,
            tkn_altcontact || '',
            tkn_category || '',
            tkn_reg_no,
            tkn_vmodel || '',
            insDate,
            cleanDate(tkn_cf_date),
            cleanDate(tkn_reg_date),
            cleanDate(tkn_permit_date),
            cleanDate(tkn_nat_permit_date),
            cleanDate(tkn_tax_date),
            cleanDate(tkn_qut_date),
            tkn_remarks || '',
            updatedBy,
            updatedDate,
            targetRenId
          ]
        );
      } else {
        // Create new renewal record
        const countRenRes = await db.query("SELECT COUNT(*) as count FROM renewal_detail WHERE ren_code_no LIKE 'REN%'");
        const totalRenCount = parseInt(countRenRes.rows[0].count);
        const renCodeNo = `REN${totalRenCount + 1}`;

        const insertRenRes = await db.query(
          `INSERT INTO renewal_detail (
            branch_id, ren_code_no, ren_adm_id, ren_date, ren_series, ren_name, ren_fname, ren_address,
            ren_chassis, ren_engine, ren_contact, ren_altcontact, ren_reg_no, ren_vmodel, ren_category,
            ren_insurance_date, ren_cf_date, ren_reg_date, ren_permit_date, ren_nat_permit_date, ren_tax_date,
            ren_qut_date, ren_remarks, added_by, updated_by, ren_status, ren_action, rej_res_id, added_date, updated_date
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $24, 1, '1', 0, $25, $25) RETURNING ren_id`,
          [
            branchId,
            renCodeNo,
            parseInt(tkn_adm_id) || updatedBy,
            cleanDate(tkn_date) || updatedDate,
            tkn_series || '',
            tkn_name,
            tkn_fname || '',
            tkn_address || '',
            tkn_chassis || '',
            tkn_engine || '',
            tkn_contact,
            tkn_altcontact || '',
            tkn_reg_no,
            tkn_vmodel || '',
            tkn_category || '',
            insDate,
            cleanDate(tkn_cf_date),
            cleanDate(tkn_reg_date),
            cleanDate(tkn_permit_date),
            cleanDate(tkn_nat_permit_date),
            cleanDate(tkn_tax_date),
            cleanDate(tkn_qut_date),
            tkn_remarks || '',
            updatedBy,
            updatedDate
          ]
        );

        targetRenId = insertRenRes.rows[0].ren_id;
      }

      // Re-associate all files in `document_detail` from this Taken to this Renewal
      await db.query(
        `UPDATE document_detail 
         SET tkn_id = 0, ren_id = $1, updated_by = $2, updated_date = $3 
         WHERE tkn_id = $4 AND document_status = 1`,
        [targetRenId, updatedBy, updatedDate, tknId]
      );
    }

    return { success: true, redirect: '/taken?flag=2' };

  } catch (err: any) {
    console.error('Failed to update taken record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function deleteTakenRecord(tknId: number) {
  try {
    const user = await getSessionUser();
    
    // Master admin (type 0) required to delete
    if (user.adm_type !== 0) {
      return { success: false, error: 'Permission denied. Master Admin required.' };
    }

    const updatedDate = new Date().toISOString();
    const updatedBy = user.adm_id;

    await db.query(
      `UPDATE taken_detail 
       SET tkn_status = 3, updated_by = $1, updated_date = $2 
       WHERE tkn_id = $3 AND branch_id = $4`,
      [updatedBy, updatedDate, tknId, user.branch_id]
    );

    return { success: true, redirect: '/taken?flag=3' };

  } catch (err: any) {
    console.error('Failed to delete taken record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function bulkActionTakenRecords(actionType: string, selectedIds: number[]) {
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
        `UPDATE taken_detail 
         SET tkn_status = 3, updated_by = $1, updated_date = $2 
         WHERE tkn_id = ANY($3) AND branch_id = $4`,
        [updatedBy, updatedDate, selectedIds, user.branch_id]
      );

      return { success: true, redirect: '/taken?flag=6' };
    } else {
      const targetAdminId = parseInt(actionType);
      if (isNaN(targetAdminId)) {
        return { success: false, error: 'Invalid action selected.' };
      }

      await db.query(
        `UPDATE taken_detail 
         SET tkn_adm_id = $1, updated_by = $2, updated_date = $3 
         WHERE tkn_id = ANY($4) AND branch_id = $5`,
        [targetAdminId, updatedBy, updatedDate, selectedIds, user.branch_id]
      );

      return { success: true, redirect: '/taken?flag=4' };
    }
  } catch (err: any) {
    console.error('Bulk action failed for taken logs:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function uploadTakenDocumentAction(formData: FormData) {
  try {
    const user = await getSessionUser();
    const tknIdStr = formData.get('tkn_id') as string;
    const documentTitle = formData.get('document_title') as string || '';
    const file = formData.get('document_image') as File;

    if (!tknIdStr || !file || file.size === 0) {
      return { success: false, error: 'Document file and Taken ID are required.' };
    }

    const tknId = parseInt(tknIdStr);
    if (isNaN(tknId)) {
      return { success: false, error: 'Invalid Taken ID.' };
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
    const filePath = `taken-documents/${ranFileName}`;

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
       ) VALUES ($1, $2, 0, $3, 0, 0, 0, 0, 0, $4, $4, 1, $5, $5)`,
      [documentTitle || fileName, fileUrl, tknId, user.adm_id, addedDate]
    );

    return { success: true, redirect: `/taken/documents?tkn_id=${tknId}&flag=1` };

  } catch (err: any) {
    console.error('Upload document error for taken logs:', err.message);
    return { success: false, error: err.message || 'File upload failed.' };
  }
}

export async function deleteTakenDocumentAction(documentId: number, tknId: number) {
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
       WHERE document_id = $3 AND tkn_id = $4`,
      [updatedBy, updatedDate, documentId, tknId]
    );

    return { success: true, redirect: `/taken/documents?tkn_id=${tknId}&flag=3` };

  } catch (err: any) {
    console.error('Failed to delete taken document:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function createTakenFollowupAction(data: any) {
  try {
    const user = await getSessionUser();
    
    // Check permission (Module ID 3 check)
    const permissions = user.md_id ? user.md_id.split(',') : [];
    if (user.adm_type !== 0 && !permissions.includes('3')) {
      return { success: false, error: 'Permission denied.' };
    }

    const { tkn_id, tknflp_date, tknflp_reminder_date, tknflp_notes } = data;

    if (!tkn_id || !tknflp_date || !tknflp_notes) {
      return { success: false, error: 'Taken ID, date and notes are required.' };
    }

    const branchId = user.branch_id || 1;
    const addedBy = user.adm_id;
    const addedDate = new Date().toISOString();

    const cleanDate = (dStr: string) => dStr && dStr.trim() !== '' ? dStr : null;

    await db.query(
      `INSERT INTO tkn_flp_detail (
        branch_id, tkn_id, tknflp_date, tknflp_reminder_date, tknflp_notes, 
        added_by, updated_by, tknflp_status, added_date, updated_date
       ) VALUES ($1, $2, $3, $4, $5, $6, $6, 1, $7, $7)`,
      [
        branchId,
        parseInt(tkn_id),
        cleanDate(tknflp_date) || addedDate,
        cleanDate(tknflp_reminder_date),
        tknflp_notes,
        addedBy,
        addedDate
      ]
    );

    return { success: true, redirect: `/taken/followup?tkn_id=${tkn_id}&flag=1` };

  } catch (err: any) {
    console.error('Failed to create taken followup:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}
