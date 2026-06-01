'use server';

import { cookies } from 'next/headers';
import { db } from '../../lib/db';

async function getSessionUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) throw new Error('Unauthorized');
  return JSON.parse(session);
}

export async function createClaimRecord(formData: FormData) {
  try {
    const user = await getSessionUser();
    
    // Check permission (Module ID 8 check)
    const permissions = user.md_id ? user.md_id.split(',') : [];
    if (user.adm_type !== 0 && !permissions.includes('8')) {
      return { success: false, error: 'Permission denied.' };
    }

    const clmDate = formData.get('clm_date') as string;
    const clmAccident = formData.get('clm_accident') as string;
    const clmNo = formData.get('clm_no') as string;
    const clmAmountStr = formData.get('clm_amount') as string;
    const clmRegno = formData.get('clm_regno') as string;
    const clmName = formData.get('clm_name') as string;
    const clmContact = formData.get('clm_contact') as string;
    const clmDescription = formData.get('clm_description') as string;
    const clmAdmIdStr = formData.get('clm_adm_id') as string;
    const clmAction = formData.get('clm_action') as string;
    const clmStageNo = formData.get('clm_stage_no') as string;
    const clmStatusStr = formData.get('clm_status') as string;
    const pdfFile = formData.get('clm_pdf') as File;

    if (!clmNo || !clmRegno || !clmName || !clmContact || !clmAmountStr) {
      return { success: false, error: 'All fields marked with an asterisk are required.' };
    }

    const clmAmount = parseFloat(clmAmountStr) || 0;
    const clmStatus = parseInt(clmStatusStr) || 1;
    const clmAdmId = parseInt(clmAdmIdStr) || user.adm_id;

    // 1. Upload Policy PDF to Supabase Cloud Storage
    let pdfUrl = '';
    if (pdfFile && pdfFile.size > 0) {
      const validExtensions = ['pdf'];
      const fileExt = pdfFile.name.split('.').pop()?.toLowerCase() || '';

      if (!validExtensions.includes(fileExt)) {
        return { success: false, error: 'Invalid Policy PDF. Only PDF format is accepted.' };
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
      const ranFileName = `${timestamp}-${pdfFile.name}`;
      const filePath = `claims-pdf/${ranFileName}`;

      const arrayBuffer = await pdfFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadUrl = `${supabaseUrl}/storage/v1/object/torque-vault/${filePath}`;
      const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/pdf',
        },
        body: buffer,
      });

      if (!uploadRes.ok) {
        console.error('Supabase Policy PDF upload failed:', await uploadRes.text());
        return { success: false, error: 'Policy PDF upload failed.' };
      }

      pdfUrl = `${supabaseUrl}/storage/v1/object/public/torque-vault/${filePath}`;
    }

    // 2. Generate sequential code `CLAIM44`
    const countRes = await db.query("SELECT COUNT(*) as count FROM claim_detail WHERE clm_code_no LIKE 'CLAIM%'");
    const totalCount = parseInt(countRes.rows[0].count);
    const clmCodeNo = `CLAIM${totalCount + 1}`;

    const branchId = user.branch_id || 1;
    const addedBy = user.adm_id;
    const addedDate = new Date().toISOString();

    const cleanDate = (dStr: string) => dStr && dStr.trim() !== '' ? dStr : null;

    // 3. Insert claim record
    await db.query(
      `INSERT INTO claim_detail (
        branch_id, clm_code_no, clm_adm_id, clm_no, clm_amount, clm_date, clm_accident, clm_regno,
        clm_pdf, clm_name, clm_contact, clm_description, clm_action, clm_stage_no,
        added_by, updated_by, clm_status, added_date, updated_date
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $15, $16, $17, $17)`,
      [
        branchId,
        clmCodeNo,
        clmAdmId,
        clmNo,
        clmAmount,
        cleanDate(clmDate) || addedDate,
        cleanDate(clmAccident) || addedDate,
        clmRegno,
        pdfUrl,
        clmName,
        clmContact,
        clmDescription || '',
        clmAction || '1',
        clmStageNo || '1',
        addedBy,
        clmStatus,
        addedDate
      ]
    );

    return { success: true, redirect: '/claims?flag=1' };

  } catch (err: any) {
    console.error('Failed to create claim record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function updateClaimRecord(clmId: number, formData: FormData) {
  try {
    const user = await getSessionUser();
    
    // Check permission (Module ID 8 check)
    const permissions = user.md_id ? user.md_id.split(',') : [];
    if (user.adm_type !== 0 && !permissions.includes('8')) {
      return { success: false, error: 'Permission denied.' };
    }

    const clmDate = formData.get('clm_date') as string;
    const clmAccident = formData.get('clm_accident') as string;
    const clmNo = formData.get('clm_no') as string;
    const clmAmountStr = formData.get('clm_amount') as string;
    const clmRegno = formData.get('clm_regno') as string;
    const clmName = formData.get('clm_name') as string;
    const clmContact = formData.get('clm_contact') as string;
    const clmDescription = formData.get('clm_description') as string;
    const clmAdmIdStr = formData.get('clm_adm_id') as string;
    const clmAction = formData.get('clm_action') as string;
    const clmStageNo = formData.get('clm_stage_no') as string;
    const clmStatusStr = formData.get('clm_status') as string;
    const removePdf = formData.get('remove_pdf') as string;
    const pdfFile = formData.get('clm_pdf') as File;
    const existingPdfUrl = formData.get('hdp_image') as string || '';

    if (!clmNo || !clmRegno || !clmName || !clmContact || !clmAmountStr) {
      return { success: false, error: 'All fields marked with an asterisk are required.' };
    }

    const clmAmount = parseFloat(clmAmountStr) || 0;
    const clmStatus = parseInt(clmStatusStr) || 1;
    const branchId = user.branch_id || 1;
    const updatedBy = user.adm_id;
    const updatedDate = new Date().toISOString();
    const cleanDate = (dStr: string) => dStr && dStr.trim() !== '' ? dStr : null;

    // Strict sub-admin boundaries: make sure they only edit their own records if they are not Master Admin
    let accessCheckQuery = `SELECT * FROM claim_detail WHERE clm_id = $1 AND branch_id = $2`;
    const checkParams = [clmId, branchId];
    if (user.adm_type !== 0) {
      accessCheckQuery += ` AND clm_adm_id = $3`;
      checkParams.push(user.adm_id);
    }
    const checkRes = await db.query(accessCheckQuery, checkParams);
    if (checkRes.rowCount === 0) {
      return { success: false, error: 'Record not found or access denied.' };
    }

    const clmAdmId = user.adm_type === 0 ? (parseInt(clmAdmIdStr) || checkRes.rows[0].clm_adm_id) : checkRes.rows[0].clm_adm_id;

    // 1. Manage PDF upload / removal
    let pdfUrl = existingPdfUrl;

    if (removePdf === 'true') {
      pdfUrl = '';
    }

    if (pdfFile && pdfFile.size > 0) {
      const validExtensions = ['pdf'];
      const fileExt = pdfFile.name.split('.').pop()?.toLowerCase() || '';

      if (!validExtensions.includes(fileExt)) {
        return { success: false, error: 'Invalid Policy PDF. Only PDF format is accepted.' };
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
      const ranFileName = `${timestamp}-${pdfFile.name}`;
      const filePath = `claims-pdf/${ranFileName}`;

      const arrayBuffer = await pdfFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadUrl = `${supabaseUrl}/storage/v1/object/torque-vault/${filePath}`;
      const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/pdf',
        },
        body: buffer,
      });

      if (!uploadRes.ok) {
        console.error('Supabase Policy PDF upload failed:', await uploadRes.text());
        return { success: false, error: 'Policy PDF upload failed.' };
      }

      pdfUrl = `${supabaseUrl}/storage/v1/object/public/torque-vault/${filePath}`;
    }

    // 2. Update the claims record
    await db.query(
      `UPDATE claim_detail 
       SET clm_adm_id = $1, clm_date = $2, clm_accident = $3, clm_no = $4, clm_amount = $5,
           clm_regno = $6, clm_pdf = $7, clm_name = $8, clm_contact = $9, clm_description = $10,
           clm_action = $11, clm_stage_no = $12, clm_status = $13, updated_by = $14, updated_date = $15
       WHERE clm_id = $16`,
      [
        clmAdmId,
        cleanDate(clmDate) || updatedDate,
        cleanDate(clmAccident) || updatedDate,
        clmNo,
        clmAmount,
        clmRegno,
        pdfUrl,
        clmName,
        clmContact,
        clmDescription || '',
        clmAction || '1',
        clmStageNo || '1',
        clmStatus,
        updatedBy,
        updatedDate,
        clmId
      ]
    );

    return { success: true, redirect: '/claims?flag=2' };

  } catch (err: any) {
    console.error('Failed to update claim record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function deleteClaimRecord(clmId: number) {
  try {
    const user = await getSessionUser();
    
    // Master admin (type 0) required to delete
    if (user.adm_type !== 0) {
      return { success: false, error: 'Permission denied. Master Admin required.' };
    }

    const updatedDate = new Date().toISOString();
    const updatedBy = user.adm_id;

    await db.query(
      `UPDATE claim_detail 
       SET clm_status = 3, updated_by = $1, updated_date = $2 
       WHERE clm_id = $3 AND branch_id = $4`,
      [updatedBy, updatedDate, clmId, user.branch_id]
    );

    return { success: true, redirect: '/claims?flag=3' };

  } catch (err: any) {
    console.error('Failed to delete claim record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function uploadClaimDocumentAction(formData: FormData) {
  try {
    const user = await getSessionUser();
    const clmIdStr = formData.get('clm_id') as string;
    const documentTitle = formData.get('document_title') as string || '';
    const file = formData.get('document_image') as File;

    if (!clmIdStr || !file || file.size === 0) {
      return { success: false, error: 'Document file and Claim ID are required.' };
    }

    const clmId = parseInt(clmIdStr);
    if (isNaN(clmId)) {
      return { success: false, error: 'Invalid Claim ID.' };
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
    const filePath = `claims-documents/${ranFileName}`;

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
       ) VALUES ($1, $2, 0, 0, 0, 0, $3, 0, 0, $4, $4, 1, $5, $5)`,
      [documentTitle || fileName, fileUrl, clmId, user.adm_id, addedDate]
    );

    return { success: true, redirect: `/claims/documents?clm_id=${clmId}&flag=1` };

  } catch (err: any) {
    console.error('Upload document error for claims logs:', err.message);
    return { success: false, error: err.message || 'File upload failed.' };
  }
}

export async function deleteClaimDocumentAction(documentId: number, clmId: number) {
  try {
    const user = await getSessionUser();

    // Check permission (Module ID 8 check)
    const permissions = user.md_id ? user.md_id.split(',') : [];
    if (user.adm_type !== 0 && !permissions.includes('8')) {
      return { success: false, error: 'Permission denied.' };
    }

    const updatedDate = new Date().toISOString();
    const updatedBy = user.adm_id;

    await db.query(
      `UPDATE document_detail 
       SET document_status = 3, updated_by = $1, updated_date = $2 
       WHERE document_id = $3 AND clm_id = $4`,
      [updatedBy, updatedDate, documentId, clmId]
    );

    return { success: true, redirect: `/claims/documents?clm_id=${clmId}&flag=3` };

  } catch (err: any) {
    console.error('Failed to delete claim document:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}
