import { NextResponse } from 'next/server';
import { auth } from './auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard');

  if (isOnDashboard && !isLoggedIn) {
    const response = NextResponse.redirect(new URL('/', req.nextUrl.origin));
    response.headers.set('x-auth-error', 'true');

    // Prevent caching of protected routes
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  }

  const response = NextResponse.next();

  // Add cache control headers to prevent back navigation issues
  if (isOnDashboard) {
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
