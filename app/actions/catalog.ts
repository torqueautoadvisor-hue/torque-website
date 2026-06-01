'use server';

import { cookies } from 'next/headers';
import { db } from '../../lib/db';

async function getSessionUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) throw new Error('Unauthorized');
  return JSON.parse(session);
}

// ==================== INSURANCE COMPANIES ====================

export async function createCompany(data: any) {
  try {
    const user = await getSessionUser();
    if (user.adm_type !== 0) return { success: false, error: 'Unauthorized.' };

    const { cmp_name, cmp_status } = data;
    if (!cmp_name) return { success: false, error: 'Company name is required.' };

    const addedDate = new Date().toISOString();

    await db.query(
      `INSERT INTO company_detail (cmp_name, added_by, updated_by, cmp_status, cmp_added, cmp_updated)
       VALUES ($1, $2, $2, $3, $4, $4)`,
      [cmp_name, user.adm_id, parseInt(cmp_status) || 1, addedDate]
    );

    return { success: true, redirect: '/setup/companies?flag=1' };
  } catch (err: any) {
    console.error('Failed to create company:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function updateCompany(cmpId: number, data: any) {
  try {
    const user = await getSessionUser();
    if (user.adm_type !== 0) return { success: false, error: 'Unauthorized.' };

    const { cmp_name, cmp_status } = data;
    if (!cmp_name) return { success: false, error: 'Company name is required.' };

    const updatedDate = new Date().toISOString();

    await db.query(
      `UPDATE company_detail
       SET cmp_name = $1, cmp_status = $2, updated_by = $3, cmp_updated = $4
       WHERE cmp_id = $5`,
      [cmp_name, parseInt(cmp_status) || 1, user.adm_id, updatedDate, cmpId]
    );

    return { success: true, redirect: '/setup/companies?flag=2' };
  } catch (err: any) {
    console.error('Failed to update company:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function deleteCompany(cmpId: number) {
  try {
    const user = await getSessionUser();
    if (user.adm_type !== 0) return { success: false, error: 'Unauthorized.' };

    const updatedDate = new Date().toISOString();

    await db.query(
      `UPDATE company_detail
       SET cmp_status = 3, updated_by = $1, cmp_updated = $2
       WHERE cmp_id = $3`,
      [user.adm_id, updatedDate, cmpId]
    );

    return { success: true, redirect: '/setup/companies?flag=3' };
  } catch (err: any) {
    console.error('Failed to delete company:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

// ==================== INSURANCE CATEGORIES ====================

export async function createCategory(data: any) {
  try {
    const user = await getSessionUser();
    if (user.adm_type !== 0) return { success: false, error: 'Unauthorized.' };

    const { ctg_name, ctg_status } = data;
    if (!ctg_name) return { success: false, error: 'Category name is required.' };

    const addedDate = new Date().toISOString();

    await db.query(
      `INSERT INTO category_detail (ctg_name, added_by, updated_by, ctg_status, ctg_added, ctg_updated)
       VALUES ($1, $2, $2, $3, $4, $4)`,
      [ctg_name, user.adm_id, parseInt(ctg_status) || 1, addedDate]
    );

    return { success: true, redirect: '/setup/categories?flag=1' };
  } catch (err: any) {
    console.error('Failed to create category:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function updateCategory(ctgId: number, data: any) {
  try {
    const user = await getSessionUser();
    if (user.adm_type !== 0) return { success: false, error: 'Unauthorized.' };

    const { ctg_name, ctg_status } = data;
    if (!ctg_name) return { success: false, error: 'Category name is required.' };

    const updatedDate = new Date().toISOString();

    await db.query(
      `UPDATE category_detail
       SET ctg_name = $1, ctg_status = $2, updated_by = $3, ctg_updated = $4
       WHERE ctg_id = $5`,
      [ctg_name, parseInt(ctg_status) || 1, user.adm_id, updatedDate, ctgId]
    );

    return { success: true, redirect: '/setup/categories?flag=2' };
  } catch (err: any) {
    console.error('Failed to update category:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function deleteCategory(ctgId: number) {
  try {
    const user = await getSessionUser();
    if (user.adm_type !== 0) return { success: false, error: 'Unauthorized.' };

    const updatedDate = new Date().toISOString();

    await db.query(
      `UPDATE category_detail
       SET ctg_status = 3, updated_by = $1, ctg_updated = $2
       WHERE ctg_id = $3`,
      [user.adm_id, updatedDate, ctgId]
    );

    return { success: true, redirect: '/setup/categories?flag=3' };
  } catch (err: any) {
    console.error('Failed to delete category:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

// ==================== AGENTS COMMISSIONS ====================

export async function createAgent(data: any) {
  try {
    const user = await getSessionUser();
    if (user.adm_type !== 0) return { success: false, error: 'Unauthorized.' };

    const { agt_number, agt_status } = data;
    if (!agt_number) return { success: false, error: 'Agent number/name is required.' };

    const addedDate = new Date().toISOString();

    await db.query(
      `INSERT INTO agent_detail (agt_number, added_by, updated_by, agt_status, agt_added, agt_updated)
       VALUES ($1, $2, $2, $3, $4, $4)`,
      [agt_number, user.adm_id, parseInt(agt_status) || 1, addedDate]
    );

    return { success: true, redirect: '/setup/agents?flag=1' };
  } catch (err: any) {
    console.error('Failed to create agent:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function updateAgent(agtId: number, data: any) {
  try {
    const user = await getSessionUser();
    if (user.adm_type !== 0) return { success: false, error: 'Unauthorized.' };

    const { agt_number, agt_status } = data;
    if (!agt_number) return { success: false, error: 'Agent number/name is required.' };

    const updatedDate = new Date().toISOString();

    await db.query(
      `UPDATE agent_detail
       SET agt_number = $1, agt_status = $2, updated_by = $3, agt_updated = $4
       WHERE agt_id = $5`,
      [agt_number, parseInt(agt_status) || 1, user.adm_id, updatedDate, agtId]
    );

    return { success: true, redirect: '/setup/agents?flag=2' };
  } catch (err: any) {
    console.error('Failed to update agent:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}

export async function deleteAgent(agtId: number) {
  try {
    const user = await getSessionUser();
    if (user.adm_type !== 0) return { success: false, error: 'Unauthorized.' };

    const updatedDate = new Date().toISOString();

    await db.query(
      `UPDATE agent_detail
       SET agt_status = 3, updated_by = $1, agt_updated = $2
       WHERE agt_id = $3`,
      [user.adm_id, updatedDate, agtId]
    );

    return { success: true, redirect: '/setup/agents?flag=3' };
  } catch (err: any) {
    console.error('Failed to delete agent:', err.message);
    return { success: false, error: 'Database transaction failed.' };
  }
}
