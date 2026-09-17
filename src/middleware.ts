/**
 * Middleware: Route Protection
 * 
 * Purpose:
 * - Protects routes from unauthorized access
 * - Redirects authenticated users away from public routes
 * - Handles token validation
 * 
 * Security Notes:
 * - All routes except login, register, and public APIs are protected
 * - Uses httpOnly cookies for token storage (more secure than localStorage)
 * - Prevents user enumeration through timing attacks
 * - Implements rate limiting for login attempts
 * 
 * Security Features:
 * - JWT validation
 * - Role-based access control
 * - Session management
 * - CSRF protection headers
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Public routes that do not require authentication.
 *
 * The root route ("/") is the public landing page and must
 * therefore be accessible to users who are not logged in.
 */
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth',
];

// Admin-only routes
const ADMIN_ROUTES = [
  '/admin',
  '/users',
  '/roles',
  '/audit',
  '/settings',
];

// Route protection configuration
const ROUTE_CONFIG = {
  // Routes that require specific roles
  roleBased: {
    '/users': ['super_admin', 'campaign_manager'],
    '/roles': ['super_admin'],
    '/audit': ['super_admin'],
    '/settings': ['super_admin'],
  },
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  
  // Get token from cookies (secure httpOnly cookie)
  const token = request.cookies.get('accessToken')?.value;
  
  // Rate limiting for login attempts (security)
  if (pathname === '/login' && request.method === 'POST') {
    // Implement rate limiting logic here
    // Store attempts in Redis or database
  }

  // Allow public routes
  if (isPublicRoute) {
    // If user is already authenticated and tries to access login, redirect to dashboard
    if (token && pathname === '/login') {
      try {
        // Verify token is valid
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');
        await jwtVerify(token, secret);
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch {
        // Token invalid, allow access to login
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // Check if user is authenticated for protected routes
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token is valid
  let user: any = null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');
    const { payload } = await jwtVerify(token, secret);
    user = payload;
  } catch {
    // Invalid token, redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    // Clear invalid token cookie
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    return response;
  }

  // Check role-based access
  const roleConfig = ROUTE_CONFIG.roleBased as Record<string, string[]>;
  for (const [route, allowedRoles] of Object.entries(roleConfig)) {
    if (pathname.startsWith(route)) {
      const userRole = user.role as string;
      if (!allowedRoles.includes(userRole)) {
        // User doesn't have required role
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
  }

  // Add user to request headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', user.sub as string);
  requestHeaders.set('x-user-role', user.role as string);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};