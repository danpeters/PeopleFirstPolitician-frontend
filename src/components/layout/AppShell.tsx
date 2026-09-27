/**
 * File:
 * C:\Projects\PeopleFirstPolitician\frontend\src\components\layout\AppShell.tsx
 *
 * Purpose:
 * Application shell and frontend route protection for the
 * PeopleFirst Politician frontend application.
 *
 * Responsibilities:
 * - Provides the authenticated application's common layout.
 * - Displays the Sidebar on authenticated pages.
 * - Controls the responsive mobile sidebar.
 * - Displays the application header.
 * - Keeps public pages free from the authenticated shell.
 * - Protects authenticated application routes.
 * - Provides frontend role-based route protection.
 * - Provides breadcrumb navigation.
 *
 * IMPORTANT SECURITY NOTE:
 * Frontend route protection is NOT the primary security boundary.
 *
 * The NestJS backend remains the authoritative security boundary
 * and independently enforces JWT authentication and permissions.
 */

'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  usePathname,
  useRouter,
} from 'next/navigation';

import Sidebar from './Sidebar';

import {
  useAuth,
} from '@/contexts/auth-context';

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * ============================================================
 * PUBLIC ROUTES
 * ============================================================
 */
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

/**
 * Determine whether the current route is public.
 */
function isPublicPath(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname);
}

/**
 * ============================================================
 * APPLICATION SHELL
 * ============================================================
 */
export default function AppShell({
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const {
    user,
    isLoading,
    isAuthenticated,
  } = useAuth();

  /**
   * Controls the responsive mobile sidebar.
   *
   * Desktop:
   * - Sidebar is always visible.
   *
   * Mobile/tablet:
   * - Sidebar is hidden until opened.
   */
  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);

  /**
   * Determine whether the current route is public.
   */
  const isPublicRoute =
    isPublicPath(pathname);

  /**
   * ==========================================================
   * ROLE REQUIREMENTS
   * ==========================================================
   */
  const getRequiredRoles = (
    currentPath: string,
  ): string[] | null => {
    /**
     * User management.
     */
    if (
      currentPath === '/users' ||
      currentPath.startsWith('/users/')
    ) {
      return [
        'super_admin',
        'campaign_manager',
      ];
    }

    /**
     * Roles and permissions.
     */
    if (
      currentPath === '/roles' ||
      currentPath.startsWith('/roles/')
    ) {
      return [
        'super_admin',
      ];
    }

    /**
     * Audit logs.
     */
    if (
      currentPath === '/audit' ||
      currentPath.startsWith('/audit/')
    ) {
      return [
        'super_admin',
        'campaign_manager',
        'analyst',
      ];
    }

    /**
     * Other authenticated routes only require authentication.
     */
    return null;
  };

  /**
   * ==========================================================
   * AUTHENTICATION AND AUTHORISATION GUARD
   * ==========================================================
   */
  useEffect(() => {
    /**
     * Public routes do not require authentication.
     */
    if (isPublicRoute) {
      return;
    }

    /**
     * Wait until AuthContext finishes checking the session.
     */
    if (isLoading) {
      return;
    }

    /**
     * Redirect unauthenticated users.
     */
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }

    /**
     * Determine role requirements.
     */
    const requiredRoles =
      getRequiredRoles(pathname);

    /**
     * No additional role restriction.
     */
    if (!requiredRoles) {
      return;
    }

    /**
     * Current authenticated role.
     */
    const currentRole =
      user.role?.name;

    /**
     * Redirect authenticated users who do not have
     * permission for the requested route.
     */
    if (
      !currentRole ||
      !requiredRoles.includes(currentRole)
    ) {
      router.replace('/dashboard');
    }
  }, [
    pathname,
    router,
    isLoading,
    isAuthenticated,
    user,
    isPublicRoute,
  ]);

  /**
   * ==========================================================
   * PUBLIC PAGES
   * ==========================================================
   */
  if (isPublicRoute) {
    return <>{children}</>;
  }

  /**
   * ==========================================================
   * AUTHENTICATION LOADING
   * ==========================================================
   */
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f7fafc',
          color: '#4a5568',
          fontSize: '15px',
        }}
      >
        Checking your session...
      </div>
    );
  }

  /**
   * ==========================================================
   * UNAUTHENTICATED STATE
   * ==========================================================
   */
  if (!isAuthenticated || !user) {
    return null;
  }

  /**
   * ==========================================================
   * ROLE PROTECTION
   * ==========================================================
   */
  const requiredRoles =
    getRequiredRoles(pathname);

  if (
    requiredRoles &&
    (
      !user.role?.name ||
      !requiredRoles.includes(
        user.role.name,
      )
    )
  ) {
    return null;
  }

  /**
   * ==========================================================
   * PAGE NAME
   * ==========================================================
   */
  const pageName =
    pathname
      .split('/')
      .filter(Boolean)
      .pop()
      ?.replace(/-/g, ' ')
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase(),
      ) ||
    'Dashboard';

  /**
   * ==========================================================
   * AUTHENTICATED APPLICATION SHELL
   * ==========================================================
   */
  return (
    <>
      {/* ======================================================
          SIDEBAR
          ====================================================== */}

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() =>
          setIsSidebarOpen(false)
        }
      />

      {/* ======================================================
          APPLICATION HEADER
          ====================================================== */}

      <header className="application-header">

        {/* Mobile menu button */}
        <button
          type="button"
          className="mobile-menu-button"
          onClick={() =>
            setIsSidebarOpen(true)
          }
          aria-label="Open navigation menu"
          aria-expanded={isSidebarOpen}
        >
          ☰
        </button>

        {/* Branding and breadcrumb */}
        <div className="header-branding">

          <img
            src="/people-first-politician-icon.png"
            alt="People First Politician"
            className="header-logo"
          />

          <div>
            <div className="application-name">
              PeopleFirst Politician
            </div>

            <div className="breadcrumb">
              <span>
                Home
              </span>

              <span className="breadcrumb-separator">
                /
              </span>

              <span className="breadcrumb-current">
                {pageName}
              </span>
            </div>
          </div>

        </div>

        {/* Application version */}
        <div className="application-version">
          Version 1.0.0
        </div>

      </header>

      {/* ======================================================
          MAIN APPLICATION CONTENT
          ====================================================== */}

      <main className="application-main">
        {children}
      </main>

      {/* ======================================================
          APP SHELL STYLES
          ====================================================== */}

      <style jsx>{`

        /* ====================================================
           DESKTOP HEADER
           ==================================================== */

        .application-header {
          position: sticky;
          top: 0;
          z-index: 900;

          margin-left: 250px;

          min-height: 72px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 0 32px;

          background: #ffffff;

          border-bottom:
            1px solid #e2e8f0;

          box-sizing: border-box;
        }

        /* ====================================================
           HEADER BRANDING
           ==================================================== */

        .header-branding {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .header-logo {
          width: 42px;
          height: 42px;
          object-fit: contain;
          flex-shrink: 0;
        }

        .application-name {
          font-size: 18px;
          font-weight: 700;
          color: #1a202c;
          line-height: 1.2;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 4px;
          font-size: 13px;
          color: #718096;
        }

        .breadcrumb-separator {
          color: #a0aec0;
        }

        .breadcrumb-current {
          color: #3182ce;
          font-weight: 500;
        }

        /* ====================================================
           VERSION
           ==================================================== */

        .application-version {
          font-size: 12px;
          color: #718096;
          white-space: nowrap;
        }

        /* ====================================================
           MOBILE MENU BUTTON
           ==================================================== */

        .mobile-menu-button {
          display: none;

          width: 42px;
          height: 42px;

          align-items: center;
          justify-content: center;

          border: 1px solid #d1d5db;
          border-radius: 8px;

          background: #ffffff;
          color: #1f2937;

          font-size: 22px;
          line-height: 1;

          cursor: pointer;
        }

        .mobile-menu-button:hover {
          background: #f3f4f6;
        }

        /* ====================================================
           MAIN CONTENT
           ==================================================== */

        .application-main {
          margin-left: 250px;
          min-height: calc(100vh - 72px);
          background: #f7fafc;
        }

        /* ====================================================
           TABLET / MOBILE
           ==================================================== */

        @media (max-width: 900px) {

          .application-header {
            margin-left: 0;
            min-height: 64px;
            padding: 0 18px;
            gap: 12px;
          }

          .mobile-menu-button {
            display: flex;
            flex-shrink: 0;
          }

          .header-logo {
            width: 36px;
            height: 36px;
          }

          .application-name {
            font-size: 16px;
          }

          .breadcrumb {
            font-size: 12px;
          }

          .application-version {
            display: none;
          }

          .application-main {
            margin-left: 0;
            min-height: calc(100vh - 64px);
          }
        }

        /* ====================================================
           SMALL MOBILE
           ==================================================== */

        @media (max-width: 480px) {

          .application-header {
            padding: 0 12px;
          }

          .header-branding {
            gap: 9px;
          }

          .header-logo {
            width: 32px;
            height: 32px;
          }

          .application-name {
            font-size: 14px;
          }

          .breadcrumb {
            font-size: 11px;
          }
        }

      `}</style>
    </>
  );
}