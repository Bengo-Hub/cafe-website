import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware: allow public and auth routes. Dashboard protection is done client-side (layout redirects to /login).
 * SSO flow: /login and /signup redirect to auth-service; /auth/callback receives code and exchanges for tokens.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAuthRoute = pathname === '/login' || pathname === '/signup' || pathname.startsWith('/auth/');
  const isPublicRoute =
    pathname === '/' ||
    pathname === '/about' ||
    pathname === '/menu' ||
    pathname === '/contact' ||
    pathname === '/loyalty' ||
    pathname === '/unauthorized' ||
    pathname.startsWith('/services/') ||
    pathname.startsWith('/events/') ||
    pathname === '/careers' ||
    pathname === '/franchising';

  if (isAuthRoute || isPublicRoute) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico).*)'],
};
