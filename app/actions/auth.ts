'use server';

import crypto from 'crypto';
import { cookies } from 'next/headers';
import { db } from '../../lib/db';

export async function loginAction(contact: string, rawPassword: string) {
  // MD5 Password hashing matching legacy database structure
  const passwordHash = crypto.createHash('md5').update(rawPassword).digest('hex');

  try {
    const res = await db.query(
      'SELECT * FROM admin_login WHERE adm_contact = $1 AND adm_password = $2 AND adm_status = 1',
      [contact, passwordHash]
    );

    if (res.rows.length === 0) {
      return { success: false, error: 'This phone number or password does not exist in our records.' };
    }

    const admin = res.rows[0];

    // Master Admin (type 0) bypasses OTP and enters directly
    if (admin.adm_type === 0) {
      const sessionData = {
        adm_id: admin.adm_id,
        adm_username: admin.adm_username,
        adm_contact: admin.adm_contact,
        adm_type: admin.adm_type,
        adm_cat_id: admin.adm_cat_id,
        branch_id: admin.branch_id
      };

      const cookieStore = await cookies();
      cookieStore.set('session', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/'
      });

      const redirectPath = admin.adm_cat_id === 2 ? '/rto' : '/insurance';
      return { success: true, redirect: redirectPath };
    } else {
      // Sub Admin Verification - Generate 6-digit random OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Store OTP in Postgres
      await db.query(
        'UPDATE admin_login SET adm_verification = $1 WHERE adm_id = $2',
        [otp, admin.adm_id]
      );

      // Log to console for development verification
      console.log(`[AUTH DEVELOPMENT ALERT] Generated OTP for user ${admin.adm_username} (${contact}): ${otp}`);

      const cookieStore = await cookies();
      cookieStore.set('otp_user_id', admin.adm_id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 600, // 10 minutes
        path: '/'
      });

      return { success: true, redirect: '/verify-otp', demoOtp: otp };
    }
  } catch (err: any) {
    console.error('Login action database query failed:', err.message);
    return { success: false, error: 'Database connection failed. Please verify Supabase status.' };
  }
}

export async function verifyOtpAction(otp: string) {
  const cookieStore = await cookies();
  const otpUserId = cookieStore.get('otp_user_id')?.value;

  if (!otpUserId) {
    return { success: false, error: 'Session expired. Please log in again.' };
  }

  try {
    const res = await db.query(
      'SELECT * FROM admin_login WHERE adm_id = $1 AND adm_verification = $2 AND adm_status = 1',
      [parseInt(otpUserId), otp]
    );

    if (res.rows.length === 0) {
      return { success: false, error: 'Verification Code Incorrect.' };
    }

    const admin = res.rows[0];

    // Clear verification OTP in database
    await db.query(
      'UPDATE admin_login SET adm_verification = NULL WHERE adm_id = $1',
      [admin.adm_id]
    );

    const sessionData = {
      adm_id: admin.adm_id,
      adm_username: admin.adm_username,
      adm_contact: admin.adm_contact,
      adm_type: admin.adm_type,
      adm_cat_id: admin.adm_cat_id,
      branch_id: admin.branch_id
    };

    cookieStore.set('session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/'
    });

    // Clear temporary otp user cookie
    cookieStore.delete('otp_user_id');

    const redirectPath = admin.adm_cat_id === 2 ? '/rto' : '/insurance';
    return { success: true, redirect: redirectPath };
  } catch (err: any) {
    console.error('Verify OTP error:', err.message);
    return { success: false, error: 'Database query failed.' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  cookieStore.delete('otp_user_id');
  return { success: true, redirect: '/' };
}
