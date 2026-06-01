'use server';

import { cookies } from 'next/headers';
import { db } from '../../lib/db';

/**
 * Secures action by checking that the user is logged in
 */
async function getSessionUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) throw new Error('Unauthorized');
  return JSON.parse(session);
}

/**
 * Delete a single global record by ID (setting status to 3)
 */
export async function deleteGlobalRecord(glbId: number) {
  try {
    const user = await getSessionUser();
    
    // Master admin (type 0) is required to delete
    if (user.adm_type !== 0) {
      return { success: false, error: 'Permission denied. Master Admin role required.' };
    }

    const updatedDate = new Date().toISOString();
    const updatedBy = user.adm_id;

    await db.query(
      `UPDATE global_detail 
       SET glb_status = 3, updated_by = $1, updated_date = $2 
       WHERE glb_id = $3 AND branch_id = $4`,
      [updatedBy, updatedDate, glbId, user.branch_id]
    );

    return { success: true, redirect: '/global?flag=3' };
  } catch (err: any) {
    console.error('Failed to delete global record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

/**
 * Bulk action processor (Delete or Assign selected records)
 */
export async function bulkActionGlobalRecords(actionType: string, selectedIds: number[]) {
  try {
    const user = await getSessionUser();

    // Check permissions (Module ID 3 check)
    // Master Admin has absolute bypass, sub-admins check permissions
    const permissions = user.md_id ? user.md_id.split(',') : [];
    if (user.adm_type !== 0 && !permissions.includes('3')) {
      return { success: false, error: 'Permission denied. Module access required.' };
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

      // Bulk update status to 3
      await db.query(
        `UPDATE global_detail 
         SET glb_status = 3, updated_by = $1, updated_date = $2 
         WHERE glb_id = ANY($3) AND branch_id = $4`,
        [updatedBy, updatedDate, selectedIds, user.branch_id]
      );

      return { success: true, redirect: '/global?flag=6' };
    } else {
      // Bulk update glb_adm_id to selected sub-admin
      const targetAdminId = parseInt(actionType);
      if (isNaN(targetAdminId)) {
        return { success: false, error: 'Invalid action selected.' };
      }

      await db.query(
        `UPDATE global_detail 
         SET glb_adm_id = $1, updated_by = $2, updated_date = $3 
         WHERE glb_id = ANY($4) AND branch_id = $5`,
        [targetAdminId, updatedBy, updatedDate, selectedIds, user.branch_id]
      );

      return { success: true, redirect: `/global?flag=4` };
    }
  } catch (err: any) {
    console.error('Bulk action failed:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

/**
 * Upload a single document to Supabase Cloud Storage bucket (torque-vault)
 * and insert record into database table `document_detail`
 */
export async function uploadGlobalDocumentAction(formData: FormData) {
  try {
    const user = await getSessionUser();
    const glbIdStr = formData.get('glb_id') as string;
    const documentTitle = formData.get('document_title') as string || '';
    const file = formData.get('document_image') as File;

    if (!glbIdStr || !file || file.size === 0) {
      return { success: false, error: 'Document file and Global ID are required.' };
    }

    const glbId = parseInt(glbIdStr);
    if (isNaN(glbId)) {
      return { success: false, error: 'Invalid Global ID.' };
    }

    // Check file extension compatibility
    const validExtensions = ['jpg', 'png', 'jpeg', 'pdf'];
    const fileName = file.name;
    const fileExt = fileName.split('.').pop()?.toLowerCase() || '';

    if (!validExtensions.includes(fileExt)) {
      return { success: false, error: 'Invalid file extension. Please select JPG, PNG, or PDF files.' };
    }

    // 1. Upload to Supabase Storage Bucket
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Create unique random file path: global-documents/{timestamp}-{filename}
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const ranFileName = `${timestamp}-${fileName}`;
    const filePath = `global-documents/${ranFileName}`;

    // Read file contents as ArrayBuffer and convert to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Call Supabase REST API to upload the file
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

    // Store the public URL
    const fileUrl = `${supabaseUrl}/storage/v1/object/public/torque-vault/${filePath}`;

    const addedBy = user.adm_id;
    const addedDate = new Date().toISOString();

    // 2. Insert record into PostgreSQL `document_detail` table
    await db.query(
      `INSERT INTO document_detail (
        document_title, document_image, glb_id, tkn_id, rto_id, ren_id, clm_id, cus_id, gen_id, 
        added_by, updated_by, document_status, added_date, updated_date
       ) VALUES ($1, $2, $3, 0, 0, 0, 0, 0, 0, $4, $4, 1, $5, $5)`,
      [documentTitle || fileName, fileUrl, glbId, addedBy, addedDate]
    );

    return { success: true, redirect: `/global/documents?glb_id=${glbId}&flag=1` };

  } catch (err: any) {
    console.error('Upload document error:', err.message);
    return { success: false, error: err.message || 'File upload failed.' };
  }
}

/**
 * Soft deletes document from PostgreSQL and deletes file from Supabase storage
 */
export async function deleteGlobalDocumentAction(documentId: number, glbId: number) {
  try {
    const user = await getSessionUser();
    
    // Check permission (Module ID 3 check)
    const permissions = user.md_id ? user.md_id.split(',') : [];
    if (user.adm_type !== 0 && !permissions.includes('3')) {
      return { success: false, error: 'Permission denied.' };
    }

    // 1. Fetch document record to get storage URL
    const res = await db.query(
      'SELECT * FROM document_detail WHERE document_id = $1 AND glb_id = $2',
      [documentId, glbId]
    );

    if (res.rows.length === 0) {
      return { success: false, error: 'Document not found.' };
    }

    const document = res.rows[0];
    const documentUrl = document.document_image;

    // 2. Delete from Supabase Storage
    if (documentUrl && documentUrl.includes('/torque-vault/')) {
      const parts = documentUrl.split('/torque-vault/');
      if (parts.length > 1) {
        const filePath = parts[1];
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        const deleteUrl = `${supabaseUrl}/storage/v1/object/torque-vault/${filePath}`;
        const deleteRes = await fetch(deleteUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
          },
        });
        
        if (!deleteRes.ok) {
          const errText = await deleteRes.text();
          console.warn('Failed to delete storage file, ignoring and setting database to deleted:', errText);
        }
      }
    }

    // 3. Soft delete in Postgres: set status to 3, empty the image
    const updatedDate = new Date().toISOString();
    const updatedBy = user.adm_id;

    await db.query(
      `UPDATE document_detail 
       SET document_status = 3, document_image = '', updated_by = $1, updated_date = $2 
       WHERE document_id = $3`,
      [updatedBy, updatedDate, documentId]
    );

    return { success: true, redirect: `/global/documents?glb_id=${glbId}&flag=3` };

  } catch (err: any) {
    console.error('Delete document error:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

/**
 * Create a new global insurance record
 */
export async function createGlobalRecord(data: any) {
  try {
    const user = await getSessionUser();
    
    // Check permission (Module ID 3 check)
    const permissions = user.md_id ? user.md_id.split(',') : [];
    if (user.adm_type !== 0 && !permissions.includes('3')) {
      return { success: false, error: 'Permission denied.' };
    }

    const glbRegNo = data.glb_reg_no || '';
    if (!glbRegNo) {
      return { success: false, error: 'Registration number is required.' };
    }

    // 1. Check duplicate record
    const dupRes = await db.query(
      "SELECT glb_id FROM global_detail WHERE glb_reg_no = $1 AND glb_status != 3 AND glb_action != '3'",
      [glbRegNo]
    );
    if (dupRes.rows.length >= 1) {
      return { success: false, duplicate: true, error: 'This registration no. is already exists' };
    }

    // 2. Generate the next glb_code_no
    const countRes = await db.query("SELECT COUNT(*) as count FROM global_detail WHERE glb_code_no LIKE 'GLB%'");
    const totalCount = parseInt(countRes.rows[0].count);
    const glbCodeNo = `GLB${totalCount + 1}`;

    const branchId = user.branch_id || 1;
    const addedBy = user.adm_id;
    const addedDate = new Date().toISOString();

    const cleanDate = (dStr: string) => dStr && dStr.trim() !== '' ? dStr : null;

    // 3. Insert record into Postgres
    await db.query(
      `INSERT INTO global_detail (
        branch_id, glb_code_no, glb_adm_id, glb_date, glb_name, glb_series, glb_fname, glb_address, 
        glb_chassis, glb_engine, glb_contact, glb_altcontact, glb_reg_no, glb_vmodel, glb_category, 
        glb_insurance_date, glb_cf_date, glb_reg_date, glb_permit_date, glb_nat_permit_date, glb_tax_date, 
        glb_qut_date, glb_remarks, added_by, updated_by, glb_status, glb_action, rej_res_id, added_date, updated_date
       ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, 
        $9, $10, $11, $12, $13, $14, $15, 
        $16, $17, $18, $19, $20, $21, 
        $22, $23, $24, $24, $25, $26, $27, $28, $28
       )`,
      [
        branchId,
        glbCodeNo,
        parseInt(data.glb_adm_id) || addedBy,
        cleanDate(data.glb_date) || addedDate,
        data.glb_name || '',
        data.glb_series || '',
        data.glb_fname || '',
        data.glb_address || '',
        data.glb_chassis || '', 
        data.glb_engine || '',  
        data.glb_contact || '',
        data.glb_altcontact || '',
        glbRegNo,
        data.glb_vmodel || '',
        data.glb_category || '',
        cleanDate(data.glb_insurance_date),
        cleanDate(data.glb_cf_date),
        cleanDate(data.glb_reg_date),
        cleanDate(data.glb_permit_date),
        cleanDate(data.glb_nat_permit_date),
        cleanDate(data.glb_tax_date),
        cleanDate(data.glb_qut_date),
        data.glb_remarks || '',
        addedBy,
        parseInt(data.glb_status) || 1,
        data.glb_action || '1',
        parseInt(data.rej_res_id) || 0,
        addedDate
      ]
    );

    return { success: true, redirect: '/global?flag=1' };

  } catch (err: any) {
    console.error('Failed to create global record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

/**
 * Edit an existing global insurance record
 */
export async function updateGlobalRecord(glbId: number, data: any) {
  try {
    const user = await getSessionUser();
    
    // Check permission (Module ID 3 check)
    const permissions = user.md_id ? user.md_id.split(',') : [];
    if (user.adm_type !== 0 && !permissions.includes('3')) {
      return { success: false, error: 'Permission denied.' };
    }

    const branchId = user.branch_id || 1;
    const updatedBy = user.adm_id;
    const updatedDate = new Date().toISOString();

    const cleanDate = (dStr: string) => dStr && dStr.trim() !== '' ? dStr : null;

    // 1. Update main global_detail table
    await db.query(
      `UPDATE global_detail 
       SET glb_adm_id = $1, glb_date = $2, glb_name = $3, glb_series = $4, glb_fname = $5, glb_address = $6, 
           glb_chassis = $7, glb_engine = $8, glb_contact = $9, glb_altcontact = $10, glb_category = $11, 
           glb_reg_no = $12, glb_vmodel = $13, glb_insurance_date = $14, glb_cf_date = $15, glb_reg_date = $16, 
           glb_permit_date = $17, glb_nat_permit_date = $18, glb_tax_date = $19, glb_qut_date = $20, 
           glb_remarks = $21, updated_by = $22, glb_status = $23, glb_action = $24, rej_res_id = $25, 
           updated_date = $26 
       WHERE glb_id = $27 AND branch_id = $28`,
      [
        parseInt(data.glb_adm_id),
        cleanDate(data.glb_date) || updatedDate,
        data.glb_name || '',
        data.glb_series || '',
        data.glb_fname || '',
        data.glb_address || '',
        data.glb_chassis || '', 
        data.glb_engine || '',  
        data.glb_contact || '',
        data.glb_altcontact || '',
        data.glb_category || '',
        data.glb_reg_no || '',
        data.glb_vmodel || '',
        cleanDate(data.glb_insurance_date),
        cleanDate(data.glb_cf_date),
        cleanDate(data.glb_reg_date),
        cleanDate(data.glb_permit_date),
        cleanDate(data.glb_nat_permit_date),
        cleanDate(data.glb_tax_date),
        cleanDate(data.glb_qut_date),
        data.glb_remarks || '',
        updatedBy,
        parseInt(data.glb_status) || 1,
        data.glb_action || '1',
        parseInt(data.rej_res_id) || 0,
        updatedDate,
        glbId,
        branchId
      ]
    );

    // 2. Automate cloning to renewal_detail if action changed to 3 (COMPLETED)
    if (data.glb_action === '3') {
      const renRegNo = data.glb_reg_no;
      
      // Check if renewal duplicate already exists
      const renDupRes = await db.query(
        "SELECT ren_id FROM renewal_detail WHERE ren_reg_no = $1 AND ren_status != 3 AND ren_action != '3'",
        [renRegNo]
      );

      if (renDupRes.rows.length >= 1) {
        // A. Update existing renewal record
        const renId = renDupRes.rows[0].ren_id;
        
        await db.query(
          `UPDATE renewal_detail 
           SET ren_adm_id = $1, ren_date = $2, ren_name = $3, ren_series = $4, ren_fname = $5, ren_address = $6, 
               ren_chassis = $7, ren_engine = $8, ren_contact = $9, ren_altcontact = $10, ren_category = $11, 
               ren_reg_no = $12, ren_vmodel = $13, ren_insurance_date = $14, ren_cf_date = $15, ren_reg_date = $16, 
               ren_permit_date = $17, ren_nat_permit_date = $18, ren_tax_date = $19, ren_qut_date = $20, 
               ren_remarks = $21, updated_by = $22, updated_date = $23 
           WHERE ren_id = $24 AND branch_id = $25`,
          [
            parseInt(data.glb_adm_id),
            cleanDate(data.glb_date) || updatedDate,
            data.glb_name || '',
            data.glb_series || '',
            data.glb_fname || '',
            data.glb_address || '',
            data.glb_chassis || '',
            data.glb_engine || '',
            data.glb_contact || '',
            data.glb_altcontact || '',
            data.glb_category || '',
            renRegNo,
            data.glb_vmodel || '',
            cleanDate(data.glb_insurance_date),
            cleanDate(data.glb_cf_date),
            cleanDate(data.glb_reg_date),
            cleanDate(data.glb_permit_date),
            cleanDate(data.glb_nat_permit_date),
            cleanDate(data.glb_tax_date),
            cleanDate(data.glb_qut_date),
            data.glb_remarks || '',
            updatedBy,
            updatedDate,
            renId,
            branchId
          ]
        );

        // B. Re-assign document attachments from glb_id to ren_id
        await db.query(
          `UPDATE document_detail 
           SET glb_id = 0, ren_id = $1, updated_by = $2, updated_date = $3 
           WHERE glb_id = $4 AND document_status = 1`,
          [renId, updatedBy, updatedDate, glbId]
        );

      } else {
        // C. Create a brand-new renewal record
        const renCountRes = await db.query("SELECT COUNT(*) as count FROM renewal_detail WHERE ren_code_no LIKE 'REN%'");
        const renCount = parseInt(renCountRes.rows[0].count);
        const renCodeNo = `REN${renCount + 1}`;

        const insertRenRes = await db.query(
          `INSERT INTO renewal_detail (
            branch_id, ren_code_no, ren_adm_id, ren_date, ren_name, ren_series, ren_fname, ren_address, 
            ren_chassis, ren_engine, ren_contact, ren_altcontact, ren_reg_no, ren_vmodel, ren_category, 
            ren_insurance_date, ren_cf_date, ren_reg_date, ren_permit_date, ren_nat_permit_date, ren_tax_date, 
            ren_qut_date, ren_remarks, added_by, updated_by, ren_status, ren_action, rej_res_id, added_date, updated_date
           ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, 
            $9, $10, $11, $12, $13, $14, $15, 
            $16, $17, $18, $19, $20, $21, 
            $22, $23, $24, $24, 1, '1', 0, $25, $25
           ) RETURNING ren_id`,
          [
            branchId,
            renCodeNo,
            parseInt(data.glb_adm_id),
            cleanDate(data.glb_date) || updatedDate,
            data.glb_name || '',
            data.glb_series || '',
            data.glb_fname || '',
            data.glb_address || '',
            data.glb_chassis || '',
            data.glb_engine || '',
            data.glb_contact || '',
            data.glb_altcontact || '',
            renRegNo,
            data.glb_vmodel || '',
            data.glb_category || '',
            cleanDate(data.glb_insurance_date),
            cleanDate(data.glb_cf_date),
            cleanDate(data.glb_reg_date),
            cleanDate(data.glb_permit_date),
            cleanDate(data.glb_nat_permit_date),
            cleanDate(data.glb_tax_date),
            cleanDate(data.glb_qut_date),
            data.glb_remarks || '',
            updatedBy,
            updatedDate
          ]
        );

        const newRenId = insertRenRes.rows[0].ren_id;

        // D. Re-assign document attachments from glb_id to new ren_id
        await db.query(
          `UPDATE document_detail 
           SET glb_id = 0, ren_id = $1, updated_by = $2, updated_date = $3 
           WHERE glb_id = $4 AND document_status = 1`,
          [newRenId, updatedBy, updatedDate, glbId]
        );
      }
    }

    return { success: true, redirect: '/global?flag=2' };

  } catch (err: any) {
    console.error('Failed to update global record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

