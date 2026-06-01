'use server';

import crypto from 'crypto';
import { cookies } from 'next/headers';
import { db } from '../../lib/db';

async function getSessionUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) throw new Error('Unauthorized');
  return JSON.parse(session);
}

export async function createSubAdmin(data: any) {
  try {
    const user = await getSessionUser();
    if (user.adm_type !== 0) {
      return { success: false, error: 'Permission denied. Master Admin required.' };
    }

    const { adm_username, adm_contact, adm_password, adm_cat_id, adm_status, md_ids } = data;

    if (!adm_username || !adm_contact || !adm_password || !adm_cat_id) {
      return { success: false, error: 'All asterisk marked fields are required.' };
    }

    // Check duplicate
    const dupRes = await db.query(
      'SELECT adm_id FROM admin_login WHERE adm_contact = $1 AND adm_status = 1',
      [adm_contact]
    );
    if (dupRes.rows.length > 0) {
      return { success: false, error: 'This phone number already exists.' };
    }

    // Join module rights
    const mdIdStr = Array.isArray(md_ids) ? md_ids.join(',') + ',' : '';

    const passwordHash = crypto.createHash('md5').update(adm_password).digest('hex');
    const branchId = user.branch_id || 1;
    const addedDate = new Date().toISOString();

    await db.query(
      `INSERT INTO admin_login (
        branch_id, adm_cat_id, adm_username, adm_contact, adm_password, adm_type, md_id, 
        added_by, updated_by, adm_status, adm_added, adm_updated
       ) VALUES ($1, $2, $3, $4, $5, 1, $6, $7, $7, $8, $9, $9)`,
      [
        branchId,
        parseInt(adm_cat_id),
        adm_username,
        adm_contact,
        passwordHash,
        mdIdStr,
        user.adm_id,
        parseInt(adm_status) || 1,
        addedDate
      ]
    );

    return { success: true, redirect: '/sub-admins?flag=1' };

  } catch (err: any) {
    console.error('Failed to create sub admin:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function updateSubAdmin(admId: number, data: any) {
  try {
    const user = await getSessionUser();
    if (user.adm_type !== 0) {
      return { success: false, error: 'Permission denied. Master Admin required.' };
    }

    const { adm_username, adm_contact, adm_password, adm_cat_id, adm_status, md_ids } = data;

    if (!adm_username || !adm_contact || !adm_cat_id) {
      return { success: false, error: 'All asterisk marked fields are required.' };
    }

    // Check duplicate (exclude current user)
    const dupRes = await db.query(
      'SELECT adm_id FROM admin_login WHERE adm_contact = $1 AND adm_id != $2 AND adm_status = 1',
      [adm_contact, admId]
    );
    if (dupRes.rows.length > 0) {
      return { success: false, error: 'This phone number already exists.' };
    }

    const mdIdStr = Array.isArray(md_ids) ? md_ids.join(',') + ',' : '';
    const updatedDate = new Date().toISOString();
    const updatedBy = user.adm_id;

    if (adm_password && adm_password.trim() !== '') {
      // Password is changing
      const passwordHash = crypto.createHash('md5').update(adm_password).digest('hex');
      await db.query(
        `UPDATE admin_login 
         SET adm_username = $1, adm_contact = $2, adm_password = $3, adm_cat_id = $4, 
             adm_status = $5, md_id = $6, updated_by = $7, adm_updated = $8 
         WHERE adm_id = $9`,
        [
          adm_username,
          adm_contact,
          passwordHash,
          parseInt(adm_cat_id),
          parseInt(adm_status),
          mdIdStr,
          updatedBy,
          updatedDate,
          admId
        ]
      );
    } else {
      // Password remains the same
      await db.query(
        `UPDATE admin_login 
         SET adm_username = $1, adm_contact = $2, adm_cat_id = $3, 
             adm_status = $4, md_id = $5, updated_by = $6, adm_updated = $7 
         WHERE adm_id = $8`,
        [
          adm_username,
          adm_contact,
          parseInt(adm_cat_id),
          parseInt(adm_status),
          mdIdStr,
          updatedBy,
          updatedDate,
          admId
        ]
      );
    }

    return { success: true, redirect: '/sub-admins?flag=2' };

  } catch (err: any) {
    console.error('Failed to update sub admin:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function deleteSubAdmin(admId: number) {
  try {
    const user = await getSessionUser();
    if (user.adm_type !== 0) {
      return { success: false, error: 'Permission denied. Master Admin required.' };
    }

    const updatedDate = new Date().toISOString();
    const updatedBy = user.adm_id;

    await db.query(
      `UPDATE admin_login 
       SET adm_status = 3, updated_by = $1, adm_updated = $2 
       WHERE adm_id = $3`,
      [updatedBy, updatedDate, admId]
    );

    return { success: true, redirect: '/sub-admins?flag=3' };

  } catch (err: any) {
    console.error('Failed to delete sub admin:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}
