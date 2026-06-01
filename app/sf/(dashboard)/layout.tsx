import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { logoutAction } from '../../actions/auth';
import DashboardClientLayout from './DashboardClientLayout';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) {
    redirect('/sf');
  }

  let sessionUser: any = {};
  try {
    sessionUser = JSON.parse(sessionCookie);
  } catch (e) {
    redirect('/sf');
  }

  // Parse permissions (md_id column)
  const permissions = sessionUser.md_id ? sessionUser.md_id.split(',') : [
    '1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18'
  ]; // Fallback to all for Master Admin type 0

  return (
    <DashboardClientLayout 
      username={sessionUser.adm_username || 'Admin'}
      permissions={permissions}
      isAdmin={sessionUser.adm_type === 0}
    >
      {children}
    </DashboardClientLayout>
  );
}
