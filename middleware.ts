import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const path = request.nextUrl.pathname;

  // Protected paths
  const isDashboardPath = 
    path.startsWith('/insurance') || 
    path.startsWith('/rto') || 
    path.startsWith('/calculators') || 
    path.startsWith('/ughrani') || 
    path.startsWith('/settings');

  if (isDashboardPath && !session) {
    // Redirect to login page if unauthorized
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect logged-in users away from auth pages
  if ((path === '/' || path === '/verify-otp') && session) {
    try {
      const sessionData = JSON.parse(session);
      const redirectPath = sessionData.adm_cat_id === 2 ? '/rto' : '/insurance';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    } catch (e) {
      // Clear corrupt session
      const response = NextResponse.next();
      response.cookies.delete('session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/verify-otp', '/insurance/:path*', '/rto/:path*', '/calculators/:path*', '/settings/:path*']
};
