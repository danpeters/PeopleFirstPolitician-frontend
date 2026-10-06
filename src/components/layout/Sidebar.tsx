/**
 * File:
 * C:\Projects\PeopleFirstPolitician\frontend\src\components\layout\Sidebar.tsx
 *
 * Purpose:
 * - Provides the authenticated navigation sidebar.
 * - Organises application navigation into collapsible sections.
 * - Displays navigation according to the authenticated user's role.
 * - Provides responsive desktop, tablet and mobile navigation.
 * - Provides logout functionality.
 *
 * Security:
 * - Frontend navigation visibility is for user experience only.
 * - Backend guards remain responsible for actual authorisation.
 *
 * Important:
 * - This component does not replace backend permissions.
 * - Routes are only exposed here when the corresponding frontend
 *   page currently exists.
 * - Future modules are represented as reserved navigation sections
 *   until their pages are implemented.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';

/**
 * ============================================================
 * TYPES
 * ============================================================
 */

interface MenuItem {
  label: string;
  href: string;
  icon: string;
  roles?: string[];
}

interface MenuSection {
  id: string;
  label: string;
  items: MenuItem[];
  roles?: string[];
  defaultOpen?: boolean;
  comingSoon?: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ============================================================
 * EXISTING WORKING ROUTES
 * ============================================================
 *
 * Only routes that currently exist are linked.
 *
 * Additional application modules will be added here as their
 * frontend pages are implemented.
 */

const menuSections: MenuSection[] = [
  {
    id: 'main',
    label: 'Main',
    defaultOpen: true,
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: '▣',
      },
    ],
  },

      {
    id: 'election-management',
    label: 'Election Management',
    defaultOpen: true,
    items: [
      {
        label: 'Elections',
        href: '/elections',
        icon: '▣',
      },
      {
        label: 'Election Positions',
        href: '/election-positions',
        icon: '▤',
      },
      {
        label: 'Electoral Scopes',
        href: '/election-scopes',
        icon: '⌖',
      },
    ],
  },

  {
    id: 'field-operations',
    label: 'Field Operations',
    defaultOpen: true,
    items: [
      {
        label: 'Electoral Geography',
        href: '/geography',
        icon: '⌖',
      },
      {
        label: 'Polling Unit Agents',
        href: '/agents',
        icon: '◉',
      },
    ],
  },

  {
    id: 'results',
    label: 'Results',
    defaultOpen: false,
    comingSoon: true,
    items: [],
  },

  {
    id: 'reports-print',
    label: 'Reports & Print',
    defaultOpen: false,
    comingSoon: true,
    items: [],
  },

  {
    id: 'administration',
    label: 'Administration',
    defaultOpen: true,
    items: [
      {
        label: 'Users',
        href: '/users',
        icon: '◉',
        roles: [
          'super_admin',
          'campaign_manager',
        ],
      },
      {
        label: 'Roles & Permissions',
        href: '/roles',
        icon: '◆',
        roles: [
          'super_admin',
        ],
      },
      {
        label: 'Audit Logs',
        href: '/audit',
        icon: '▤',
        roles: [
          'super_admin',
          'campaign_manager',
          'analyst',
        ],
      },
      {
        label: 'Settings',
        href: '/settings',
        icon: '⚙',
      },
    ],
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
   * Track which navigation sections are expanded.
   *
   * Sections are initialised from their defaultOpen value.
   */
  const [openSections, setOpenSections] = useState<
    Record<string, boolean>
  >(() =>
    menuSections.reduce(
      (accumulator, section) => {
        accumulator[section.id] =
          section.defaultOpen ?? false;

        return accumulator;
      },
      {} as Record<string, boolean>,
    ),
  );

  /**
   * Current authenticated role.
   */
  const currentRole =
    user?.role?.name ?? 'user';

  /**
   * Determine whether the authenticated user can see
   * a particular section.
   */
  const canSeeSection = (
    section: MenuSection,
  ): boolean => {
    if (!section.roles) {
      return true;
    }

    return section.roles.includes(
      currentRole,
    );
  };

  /**
   * Only display navigation items permitted for the
   * current authenticated role.
   */
  const getVisibleItems = (
    section: MenuSection,
  ): MenuItem[] => {
    return section.items.filter(
      (item) => {
        if (!item.roles) {
          return true;
        }

        return item.roles.includes(
          currentRole,
        );
      },
    );
  };

  /**
   * Toggle a navigation section.
   */
  const toggleSection = (
    sectionId: string,
  ) => {
    setOpenSections(
      (current) => ({
        ...current,
        [sectionId]:
          !current[sectionId],
      }),
    );
  };

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

  /**
   * Close the mobile navigation after
   * selecting a page.
   */
  const handleNavigation = () => {
    onClose();
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

          {menuSections
            .filter(canSeeSection)
            .map((section) => {
              const visibleItems =
                getVisibleItems(section);

              /**
               * Hide a section if it has no current
               * items and is not explicitly marked as
               * coming soon.
               */
              if (
                visibleItems.length === 0 &&
                !section.comingSoon
              ) {
                return null;
              }

              const isOpenSection =
                openSections[
                  section.id
                ] ?? false;

              return (
                <div
                  key={section.id}
                  className="sidebar-section"
                >

                  {/* ==========================================
                      SECTION HEADER
                      ========================================== */}

                  <button
                    type="button"
                    className="sidebar-section-button"
                    onClick={() =>
                      toggleSection(
                        section.id,
                      )
                    }
                    aria-expanded={
                      isOpenSection
                    }
                  >
                    <span className="sidebar-section-label">
                      {section.label}
                    </span>

                    <span
                      className="sidebar-section-arrow"
                      aria-hidden="true"
                    >
                      {isOpenSection
                        ? '−'
                        : '+'}
                    </span>
                  </button>

                  {/* ==========================================
                      SECTION CONTENT
                      ========================================== */}

                  {isOpenSection && (
                    <div className="sidebar-section-content">

                      {visibleItems.map(
                        (item) => {
                          const active =
                            isItemActive(
                              item.href,
                            );

                          return (
                            <Link
                              key={
                                item.href
                              }
                              href={
                                item.href
                              }
                              className={
                                `sidebar-link ${
                                  active
                                    ? 'sidebar-link-active'
                                    : ''
                                }`
                              }
                              onClick={
                                handleNavigation
                              }
                            >
                              <span
                                className="sidebar-link-icon"
                                aria-hidden="true"
                              >
                                {
                                  item.icon
                                }
                              </span>

                              <span className="sidebar-link-label">
                                {
                                  item.label
                                }
                              </span>
                            </Link>
                          );
                        },
                      )}

                      {/* ========================================
                          FUTURE MODULE INDICATOR
                          ======================================== */}

                      {section.comingSoon &&
                        visibleItems.length ===
                          0 && (
                          <div className="sidebar-coming-soon">
                            <span>
                              Coming soon
                            </span>
                          </div>
                        )}

                    </div>
                  )}

                </div>
              );
            })}

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
              ⇥
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