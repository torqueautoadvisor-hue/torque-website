'use server';

import { cookies } from 'next/headers';
import { db } from '../../lib/db';

async function getSessionUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) throw new Error('Unauthorized');
  return JSON.parse(session);
}

// Map service ID to module permissions:
// service_id = 1 is License Work (Module 6)
// service_id = 2 is Vahan Work (Module 7)
function checkModulePermission(user: any, serviceId: number) {
  const permissions = user.md_id ? user.md_id.split(',') : [];
  if (user.adm_type === 0) return true; // Master Admin bypass
  const targetModule = serviceId === 1 ? '6' : '7';
  return permissions.includes(targetModule);
}

export async function createRtoRecord(serviceId: number, formData: FormData) {
  try {
    const user = await getSessionUser();
    if (!checkModulePermission(user, serviceId)) {
      return { success: false, error: 'Permission denied.' };
    }

    const rtoDate = formData.get('rto_date') as string;
    const rtoDuedate = formData.get('rto_duedate') as string;
    const rtoRegno = formData.get('rto_regno') as string;
    const rtoName = formData.get('rto_name') as string;
    const rtoContact = formData.get('rto_contact') as string;
    const rtoDescription = formData.get('rto_description') as string || '';
    const rtoAmountStr = formData.get('rto_amount') as string || '0';
    const rtoCreditStr = formData.get('rto_credit') as string || '0';
    const rtoAdmIdStr = formData.get('rto_adm_id') as string;
    const rtoAction = formData.get('rto_action') as string || '1';
    const penResIdStr = formData.get('pen_res_id') as string;
    const rtoStageNo = formData.get('rto_stage_no') as string || '1';
    const rtoStageName = formData.get('rto_stage_name') as string || '';

    if (!rtoRegno || !rtoName || !rtoContact || !rtoAmountStr) {
      return { success: false, error: 'All fields marked with an asterisk are required.' };
    }

    const rtoAmount = parseFloat(rtoAmountStr) || 0;
    const rtoCredit = parseFloat(rtoCreditStr) || 0;
    const rtoDebit = rtoAmount - rtoCredit; // Debit is pending balance

    const rtoAdmId = parseInt(rtoAdmIdStr) || user.adm_id;
    const penResId = penResIdStr ? parseInt(penResIdStr) : null;
    const branchId = user.branch_id || 1;
    const addedBy = user.adm_id;
    const addedDate = new Date().toISOString();

    // Generate sequential code: LIC{count+1} or VAH{count+1}
    const prefix = serviceId === 1 ? 'LIC' : 'VAH';
    const countRes = await db.query(
      "SELECT COUNT(*) as count FROM rto_detail WHERE service_id = $1 AND rto_code_no LIKE $2",
      [serviceId, `${prefix}%`]
    );
    const totalCount = parseInt(countRes.rows[0].count) || 0;
    const rtoCodeNo = `${prefix}${totalCount + 1}`;

    const cleanDate = (dStr: string) => dStr && dStr.trim() !== '' ? dStr : null;

    await db.query(
      `INSERT INTO rto_detail (
        branch_id, rto_code_no, rto_adm_id, service_id, service_multiple, rto_date, rto_duedate,
        rto_regno, rto_name, rto_contact, rto_description, rto_amount, rto_credit, rto_debit,
        rto_action, pen_res_id, rto_stage_no, rto_stage_name, added_by, updated_by, rto_status,
        added_date, updated_date
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $19, 1, $20, $20)`,
      [
        branchId,
        rtoCodeNo,
        rtoAdmId,
        serviceId,
        '', // service_multiple is empty default
        cleanDate(rtoDate) || addedDate,
        cleanDate(rtoDuedate),
        rtoRegno,
        rtoName,
        rtoContact,
        rtoDescription,
        rtoAmount.toString(),
        rtoCredit.toString(),
        rtoDebit.toString(),
        rtoAction,
        penResId,
        rtoStageNo,
        rtoStageName,
        addedBy,
        addedDate
      ]
    );

    const redirectPath = serviceId === 1 ? '/license?flag=1' : '/vahan?flag=1';
    return { success: true, redirect: redirectPath };

  } catch (err: any) {
    console.error('Failed to create RTO record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function updateRtoRecord(rtoId: number, serviceId: number, formData: FormData) {
  try {
    const user = await getSessionUser();
    if (!checkModulePermission(user, serviceId)) {
      return { success: false, error: 'Permission denied.' };
    }

    const rtoDate = formData.get('rto_date') as string;
    const rtoDuedate = formData.get('rto_duedate') as string;
    const rtoRegno = formData.get('rto_regno') as string;
    const rtoName = formData.get('rto_name') as string;
    const rtoContact = formData.get('rto_contact') as string;
    const rtoDescription = formData.get('rto_description') as string || '';
    const rtoAmountStr = formData.get('rto_amount') as string || '0';
    const rtoCreditStr = formData.get('rto_credit') as string || '0';
    const rtoAdmIdStr = formData.get('rto_adm_id') as string;
    const rtoAction = formData.get('rto_action') as string || '1';
    const penResIdStr = formData.get('pen_res_id') as string;
    const rtoStageNo = formData.get('rto_stage_no') as string || '1';
    const rtoStageName = formData.get('rto_stage_name') as string || '';
    const rtoStatusStr = formData.get('rto_status') as string || '1';

    if (!rtoRegno || !rtoName || !rtoContact || !rtoAmountStr) {
      return { success: false, error: 'All fields marked with an asterisk are required.' };
    }

    const rtoAmount = parseFloat(rtoAmountStr) || 0;
    const rtoCredit = parseFloat(rtoCreditStr) || 0;
    const rtoDebit = rtoAmount - rtoCredit; // Debit is pending balance

    const penResId = penResIdStr ? parseInt(penResIdStr) : null;
    const rtoStatus = parseInt(rtoStatusStr) || 1;
    const branchId = user.branch_id || 1;
    const updatedBy = user.adm_id;
    const updatedDate = new Date().toISOString();
    const cleanDate = (dStr: string) => dStr && dStr.trim() !== '' ? dStr : null;

    // Confinement validation: sub-admins can only modify their assigned records
    let accessCheckQuery = `SELECT * FROM rto_detail WHERE rto_id = $1 AND branch_id = $2 AND service_id = $3`;
    const checkParams = [rtoId, branchId, serviceId];
    if (user.adm_type !== 0) {
      accessCheckQuery += ` AND rto_adm_id = $4`;
      checkParams.push(user.adm_id);
    }
    const checkRes = await db.query(accessCheckQuery, checkParams);
    if (checkRes.rowCount === 0) {
      return { success: false, error: 'Record not found or access denied.' };
    }

    const rtoAdmId = user.adm_type === 0 ? (parseInt(rtoAdmIdStr) || checkRes.rows[0].rto_adm_id) : checkRes.rows[0].rto_adm_id;

    await db.query(
      `UPDATE rto_detail 
       SET rto_adm_id = $1, rto_date = $2, rto_duedate = $3, rto_regno = $4, rto_name = $5,
           rto_contact = $6, rto_description = $7, rto_amount = $8, rto_credit = $9, rto_debit = $10,
           rto_action = $11, pen_res_id = $12, rto_stage_no = $13, rto_stage_name = $14,
           rto_status = $15, updated_by = $16, updated_date = $17
       WHERE rto_id = $18`,
      [
        rtoAdmId,
        cleanDate(rtoDate) || updatedDate,
        cleanDate(rtoDuedate),
        rtoRegno,
        rtoName,
        rtoContact,
        rtoDescription,
        rtoAmount.toString(),
        rtoCredit.toString(),
        rtoDebit.toString(),
        rtoAction,
        penResId,
        rtoStageNo,
        rtoStageName,
        rtoStatus,
        updatedBy,
        updatedDate,
        rtoId
      ]
    );

    const redirectPath = serviceId === 1 ? '/license?flag=2' : '/vahan?flag=2';
    return { success: true, redirect: redirectPath };

  } catch (err: any) {
    console.error('Failed to update RTO record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function deleteRtoRecord(rtoId: number, serviceId: number) {
  try {
    const user = await getSessionUser();
    if (user.adm_type !== 0) {
      return { success: false, error: 'Permission denied. Master Admin required.' };
    }

    const updatedDate = new Date().toISOString();
    const updatedBy = user.adm_id;

    await db.query(
      `UPDATE rto_detail 
       SET rto_status = 3, updated_by = $1, updated_date = $2 
       WHERE rto_id = $3 AND branch_id = $4 AND service_id = $5`,
      [updatedBy, updatedDate, rtoId, user.branch_id, serviceId]
    );

    const redirectPath = serviceId === 1 ? '/license?flag=3' : '/vahan?flag=3';
    return { success: true, redirect: redirectPath };

  } catch (err: any) {
    console.error('Failed to delete RTO record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function bulkActionRtoRecords(serviceId: number, actionType: string, selectedIds: number[]) {
  try {
    const user = await getSessionUser();
    if (user.adm_type !== 0) {
      return { success: false, error: 'Permission denied. Master Admin required.' };
    }

    const updatedDate = new Date().toISOString();
    const updatedBy = user.adm_id;

    if (actionType === 'DELETE') {
      await db.query(
        `UPDATE rto_detail 
         SET rto_status = 3, updated_by = $1, updated_date = $2 
         WHERE rto_id = ANY($3) AND branch_id = $4 AND service_id = $5`,
        [updatedBy, updatedDate, selectedIds, user.branch_id, serviceId]
      );
      const redirectPath = serviceId === 1 ? '/license?flag=6' : '/vahan?flag=6';
      return { success: true, redirect: redirectPath };
    } else {
      // Re-assign action
      const targetStaffId = parseInt(actionType);
      if (isNaN(targetStaffId)) {
        return { success: false, error: 'Invalid staff selection.' };
      }

      await db.query(
        `UPDATE rto_detail 
         SET rto_adm_id = $1, updated_by = $2, updated_date = $3 
         WHERE rto_id = ANY($4) AND branch_id = $5 AND service_id = $6`,
        [targetStaffId, updatedBy, updatedDate, selectedIds, user.branch_id, serviceId]
      );
      const redirectPath = serviceId === 1 ? '/license?flag=4' : '/vahan?flag=4';
      return { success: true, redirect: redirectPath };
    }

  } catch (err: any) {
    console.error('Failed to execute bulk action for RTO records:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function uploadRtoDocumentAction(formData: FormData) {
  try {
    const user = await getSessionUser();
    const rtoIdStr = formData.get('rto_id') as string;
    const serviceIdStr = formData.get('service_id') as string;
    const documentTitle = formData.get('document_title') as string || '';
    const file = formData.get('document_image') as File;

    if (!rtoIdStr || !serviceIdStr || !file || file.size === 0) {
      return { success: false, error: 'Document file, RTO ID, and Service ID are required.' };
    }

    const rtoId = parseInt(rtoIdStr);
    const serviceId = parseInt(serviceIdStr);

    const validExtensions = ['jpg', 'png', 'jpeg', 'pdf'];
    const fileName = file.name;
    const fileExt = fileName.split('.').pop()?.toLowerCase() || '';

    if (!validExtensions.includes(fileExt)) {
      return { success: false, error: 'Invalid file. Please select JPG, PNG, or PDF.' };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const ranFileName = `${timestamp}-${fileName}`;
    const filePath = `rto-documents/${ranFileName}`;

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
      console.error('Supabase RTO attachment upload failed:', await uploadRes.text());
      return { success: false, error: 'Cloud file upload failed.' };
    }

    const fileUrl = `${supabaseUrl}/storage/v1/object/public/torque-vault/${filePath}`;
    const addedDate = new Date().toISOString();

    await db.query(
      `INSERT INTO document_detail (
        document_title, document_image, glb_id, tkn_id, rto_id, ren_id, clm_id, cus_id, gen_id, 
        added_by, updated_by, document_status, added_date, updated_date
       ) VALUES ($1, $2, 0, 0, $3, 0, 0, 0, 0, $4, $4, 1, $5, $5)`,
      [documentTitle || fileName, fileUrl, rtoId, user.adm_id, addedDate]
    );

    const redirectPath = serviceId === 1 
      ? `/license/documents?rto_id=${rtoId}&flag=1`
      : `/vahan/documents?rto_id=${rtoId}&flag=1`;

    return { success: true, redirect: redirectPath };

  } catch (err: any) {
    console.error('Upload document error for RTO logs:', err.message);
    return { success: false, error: 'File upload failed.' };
  }
}

export async function deleteRtoDocumentAction(documentId: number, rtoId: number, serviceId: number) {
  try {
    const user = await getSessionUser();
    const updatedDate = new Date().toISOString();
    const updatedBy = user.adm_id;

    await db.query(
      `UPDATE document_detail 
       SET document_status = 3, updated_by = $1, updated_date = $2 
       WHERE document_id = $3 AND rto_id = $4`,
      [updatedBy, updatedDate, documentId, rtoId]
    );

    const redirectPath = serviceId === 1 
      ? `/license/documents?rto_id=${rtoId}&flag=3`
      : `/vahan/documents?rto_id=${rtoId}&flag=3`;

    return { success: true, redirect: redirectPath };

  } catch (err: any) {
    console.error('Failed to delete RTO document:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}
