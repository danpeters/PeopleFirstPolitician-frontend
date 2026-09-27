/**
 * File:
 * C:\Projects\PeopleFirstPolitician\frontend\src\components\layout\Sidebar.tsx
 *
 * Purpose:
 * - Provides the authenticated navigation sidebar.
 * - Displays navigation according to the authenticated user's role.
 * - Provides responsive desktop, tablet and mobile navigation.
 * - Provides logout functionality.
 *
 * Responsive behaviour:
 * - Desktop: fixed vertical sidebar.
 * - Tablet/mobile: slide-out navigation drawer.
 * - Mobile overlay closes the drawer when tapped.
 * - Selecting a navigation item closes the mobile drawer.
 *
 * Security note:
 * - Frontend navigation visibility is for user experience only.
 * - Backend guards remain responsible for actual authorisation.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

/**
 * Navigation item definition.
 */
interface MenuItem {
  label: string;
  href: string;
  icon: string;
  roles?: string[];
}

/**
 * Sidebar properties.
 */
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ============================================================
 * NAVIGATION ITEMS
 * ============================================================
 */
const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: '🏠',
  },
  {
    label: 'Electoral Geography',
    href: '/geography',
    icon: '📍',
  },
  {
    label: 'Users',
    href: '/users',
    icon: '👥',
    roles: [
      'super_admin',
      'campaign_manager',
    ],
  },
  {
    label: 'Roles & Permissions',
    href: '/roles',
    icon: '🛡️',
    roles: [
      'super_admin',
    ],
  },
  {
    label: 'Audit Logs',
    href: '/audit',
    icon: '📋',
    roles: [
      'super_admin',
      'campaign_manager',
      'analyst',
    ],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: '⚙️',
  },
];

/**
 * ============================================================
 * SIDEBAR COMPONENT
 * ============================================================
 */
export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  const {
    user,
    logout,
  } = useAuth();

  /**
   * Current authenticated role.
   */
  const currentRole =
    user?.role?.name ?? 'user';

  /**
   * Only display navigation items permitted for the
   * current authenticated role.
   */
  const visibleMenuItems =
    menuItems.filter((item) => {
      if (!item.roles) {
        return true;
      }

      return item.roles.includes(
        currentRole,
      );
    });

  /**
   * Logout handler.
   */
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(
        'Logout error:',
        error,
      );
    }
  };

  /**
   * Determine whether a navigation item is active.
   */
  const isItemActive = (
    href: string,
  ): boolean => {
    return (
      pathname === href ||
      (
        href !== '/dashboard' &&
        pathname.startsWith(
          `${href}/`,
        )
      )
    );
  };

  return (
    <>
      {/* ======================================================
          MOBILE OVERLAY
          ====================================================== */}

      {isOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation menu"
          onClick={onClose}
        />
      )}

      {/* ======================================================
          SIDEBAR
          ====================================================== */}

      <aside
        className={`app-sidebar ${
          isOpen
            ? 'app-sidebar-open'
            : ''
        }`}
        aria-label="Main navigation"
      >

        {/* ====================================================
            MOBILE SIDEBAR HEADER
            ==================================================== */}

        <div className="sidebar-mobile-header">

          <div>
            <div className="sidebar-brand-title">
              PeopleFirst
            </div>

            <div className="sidebar-brand-subtitle">
              Politician
            </div>
          </div>

          <button
            type="button"
            className="sidebar-close-button"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            ×
          </button>

        </div>

        {/* ====================================================
            DESKTOP BRANDING
            ==================================================== */}

        <div className="sidebar-brand">

          <div className="sidebar-brand-title">
            PeopleFirst
          </div>

          <div className="sidebar-brand-subtitle">
            Politician
          </div>

        </div>

        {/* ====================================================
            NAVIGATION
            ==================================================== */}

        <nav
          className="sidebar-navigation"
          aria-label="Application navigation"
        >

          {visibleMenuItems.map(
            (item) => {
              const active =
                isItemActive(
                  item.href,
                );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    `sidebar-link ${
                      active
                        ? 'sidebar-link-active'
                        : ''
                    }`
                  }
                  onClick={onClose}
                >
                  <span
                    className="sidebar-link-icon"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>

                  <span className="sidebar-link-label">
                    {item.label}
                  </span>
                </Link>
              );
            },
          )}

        </nav>

        {/* ====================================================
            LOGOUT
            ==================================================== */}

        <div className="sidebar-logout-container">

          <button
            type="button"
            className="sidebar-logout-button"
            onClick={handleLogout}
          >
            <span
              className="sidebar-link-icon"
              aria-hidden="true"
            >
              🚪
            </span>

            <span className="sidebar-link-label">
              Logout
            </span>
          </button>

        </div>

      </aside>
    </>
  );
}