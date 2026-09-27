/**
 * File:
 * C:\Projects\PeopleFirstPolitician\frontend\middleware.ts
 *
 * Purpose:
 * Route protection middleware for the People First Politician
 * frontend application.
 *
 * Responsibilities:
 * - Allow public pages without authentication.
 * - Protect authenticated application pages.
 * - Redirect unauthenticated users to the login page.
 * - Prevent authenticated users from unnecessarily returning
 *   to login or registration pages.
 * - Keep password-recovery pages publicly accessible.
 *
 * Public routes:
 * - /
 * - /login
 * - /register
 * - /forgot-password
 * - /reset-password
 *
 * Important security note:
 * This middleware checks whether an access-token cookie exists.
 * It does NOT validate the JWT itself.
 *
 * Actual authentication and authorisation remain the responsibility
 * of the backend API.
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * ============================================================
 * PUBLIC ROUTES
 * ============================================================
 *
 * These routes must NEVER require authentication.
 */
const publicRoutes = new Set([
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]);

/**
 * ============================================================
 * MIDDLEWARE
 * ============================================================
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  /**
   * Read the access-token cookie.
   *
   * The login page creates this cookie after successful
   * authentication so that middleware can recognise the
   * authenticated browser session.
   */
  const accessToken = request.cookies.get('accessToken')?.value;

  /**
   * ----------------------------------------------------------
   * PUBLIC ROUTES
   * ----------------------------------------------------------
   *
   * Registration and password-recovery pages must be accessible
   * even when the visitor has no access token.
   */
  if (publicRoutes.has(pathname)) {
    /**
     * If an authenticated user visits login or registration,
     * send them to the dashboard.
     *
     * Password-recovery pages are deliberately NOT redirected.
     */
    if (
      accessToken &&
      (pathname === '/login' || pathname === '/register')
    ) {
      return NextResponse.redirect(
        new URL('/dashboard', request.url),
      );
    }

    return NextResponse.next();
  }

  /**
   * ----------------------------------------------------------
   * PROTECTED ROUTES
   * ----------------------------------------------------------
   *
   * Every route not explicitly listed above requires an
   * access-token cookie.
   */
  if (!accessToken) {
    const loginUrl = new URL('/login', request.url);

    /**
     * Preserve the requested path so that the application
     * knows where the user originally intended to go.
     */
    loginUrl.searchParams.set(
      'redirect',
      pathname,
    );

    return NextResponse.redirect(loginUrl);
  }

  /**
   * ----------------------------------------------------------
   * AUTHENTICATED REQUEST
   * ----------------------------------------------------------
   */
  return NextResponse.next();
}

/**
 * ============================================================
 * MIDDLEWARE MATCHER
 * ============================================================
 *
 * Apply middleware to application routes while excluding
 * Next.js static assets and common image/font files.
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff|woff2|ttf|eot)$).*)',
  ],
};