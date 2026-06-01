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
  return permissions.includes('12'); // Module 12 for Fitness & Permit
}

export async function createFitperRecord(formData: FormData) {
  try {
    const user = await getSessionUser();
    if (!checkModulePermission(user)) {
      return { success: false, error: 'Permission denied.' };
    }

    const fpDate = formData.get('fp_date') as string;
    const fpRegno = formData.get('fp_regno') as string;
    const fpName = formData.get('fp_name') as string;
    const pdfFile = formData.get('fp_pdf') as File;

    if (!fpRegno || !fpName) {
      return { success: false, error: 'All fields marked with an asterisk are required.' };
    }

    // Upload PDF to Supabase Cloud Storage
    let pdfUrl = '';
    if (pdfFile && pdfFile.size > 0) {
      const validExtensions = ['pdf'];
      const fileExt = pdfFile.name.split('.').pop()?.toLowerCase() || '';

      if (!validExtensions.includes(fileExt)) {
        return { success: false, error: 'Invalid PDF. Only PDF format is accepted.' };
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
      const ranFileName = `${timestamp}-${pdfFile.name}`;
      const filePath = `fitper-pdf/${ranFileName}`;

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
        console.error('Supabase FitPer PDF upload failed:', await uploadRes.text());
        return { success: false, error: 'PDF file upload failed.' };
      }

      pdfUrl = `${supabaseUrl}/storage/v1/object/public/torque-vault/${filePath}`;
    }

    // Generate sequential code: FP{count+1}
    const countRes = await db.query("SELECT COUNT(*) as count FROM fitper_detail WHERE fp_code_no LIKE 'FP%'");
    const totalCount = parseInt(countRes.rows[0].count) || 0;
    const fpCodeNo = `FP${totalCount + 1}`;

    const branchId = user.branch_id || 1;
    const addedBy = user.adm_id;
    const addedDate = new Date().toISOString();
    const cleanDate = (dStr: string) => dStr && dStr.trim() !== '' ? dStr : null;

    await db.query(
      `INSERT INTO fitper_detail (
        branch_id, fp_code_no, fp_date, fp_regno, fp_name, fp_pdf, added_by, updated_by, fp_status,
        added_date, updated_date
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $7, 1, $8, $8)`,
      [
        branchId,
        fpCodeNo,
        cleanDate(fpDate) || addedDate,
        fpRegno,
        fpName,
        pdfUrl,
        addedBy,
        addedDate
      ]
    );

    return { success: true, redirect: '/fitness?flag=1' };

  } catch (err: any) {
    console.error('Failed to create Fitper record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function updateFitperRecord(fpId: number, formData: FormData) {
  try {
    const user = await getSessionUser();
    if (!checkModulePermission(user)) {
      return { success: false, error: 'Permission denied.' };
    }

    const fpDate = formData.get('fp_date') as string;
    const fpRegno = formData.get('fp_regno') as string;
    const fpName = formData.get('fp_name') as string;
    const pdfFile = formData.get('fp_pdf') as File;
    const existingPdfUrl = formData.get('hdp_image') as string || '';
    const removePdf = formData.get('remove_pdf') as string;
    const fpStatusStr = formData.get('fp_status') as string || '1';

    if (!fpRegno || !fpName) {
      return { success: false, error: 'All fields marked with an asterisk are required.' };
    }

    const branchId = user.branch_id || 1;
    const updatedBy = user.adm_id;
    const updatedDate = new Date().toISOString();
    const cleanDate = (dStr: string) => dStr && dStr.trim() !== '' ? dStr : null;
    const fpStatus = parseInt(fpStatusStr) || 1;

    // Confinement validation: sub-admins can only modify records inside their branch boundaries
    const checkRes = await db.query(
      'SELECT * FROM fitper_detail WHERE fp_id = $1 AND branch_id = $2 AND fp_status != 3',
      [fpId, branchId]
    );
    if (checkRes.rowCount === 0) {
      return { success: false, error: 'Record not found or access denied.' };
    }

    let pdfUrl = existingPdfUrl;
    if (removePdf === 'true') {
      pdfUrl = '';
    }

    if (pdfFile && pdfFile.size > 0) {
      const validExtensions = ['pdf'];
      const fileExt = pdfFile.name.split('.').pop()?.toLowerCase() || '';

      if (!validExtensions.includes(fileExt)) {
        return { success: false, error: 'Invalid PDF. Only PDF format is accepted.' };
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
      const ranFileName = `${timestamp}-${pdfFile.name}`;
      const filePath = `fitper-pdf/${ranFileName}`;

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
        console.error('Supabase FitPer PDF upload failed:', await uploadRes.text());
        return { success: false, error: 'PDF file upload failed.' };
      }

      pdfUrl = `${supabaseUrl}/storage/v1/object/public/torque-vault/${filePath}`;
    }

    await db.query(
      `UPDATE fitper_detail 
       SET fp_date = $1, fp_regno = $2, fp_name = $3, fp_pdf = $4, fp_status = $5,
           updated_by = $6, updated_date = $7
       WHERE fp_id = $8`,
      [
        cleanDate(fpDate) || updatedDate,
        fpRegno,
        fpName,
        pdfUrl,
        fpStatus,
        updatedBy,
        updatedDate,
        fpId
      ]
    );

    return { success: true, redirect: '/fitness?flag=2' };

  } catch (err: any) {
    console.error('Failed to update Fitper record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function deleteFitperRecord(fpId: number) {
  try {
    const user = await getSessionUser();
    if (user.adm_type !== 0) {
      return { success: false, error: 'Permission denied. Master Admin required.' };
    }

    const updatedDate = new Date().toISOString();
    const updatedBy = user.adm_id;

    await db.query(
      `UPDATE fitper_detail 
       SET fp_status = 3, updated_by = $1, updated_date = $2 
       WHERE fp_id = $3 AND branch_id = $4`,
      [updatedBy, updatedDate, fpId, user.branch_id]
    );

    return { success: true, redirect: '/fitness?flag=3' };

  } catch (err: any) {
    console.error('Failed to delete Fitper record:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}
