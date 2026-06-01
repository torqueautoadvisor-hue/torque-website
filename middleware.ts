import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const path = request.nextUrl.pathname;

  const isAuthPage = path === '/sf' || path === '/sf/verify-otp';

  if (!session) {
    // If not logged in and requesting a protected CRM page, redirect to /sf (login page)
    if (!isAuthPage) {
      return NextResponse.redirect(new URL('/sf', request.url));
    }
  } else {
    // If logged in and requesting the auth pages (/sf or /sf/verify-otp), redirect to dashboard
    if (isAuthPage) {
      try {
        const sessionData = JSON.parse(session);
        const redirectPath = sessionData.adm_cat_id === 2 ? '/sf/rto' : '/sf/insurance';
        return NextResponse.redirect(new URL(redirectPath, request.url));
      } catch (e) {
        // Clear corrupt session cookie
        const response = NextResponse.next();
        response.cookies.delete('session');
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  // Only match /sf and subpaths
  matcher: [
    '/sf/:path*'
  ]
};
