// File: C:\Projects\PeopleFirstPolitician\frontend\src\components\layout\Sidebar.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

const menuItems = [
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
  },
  {
    label: 'Roles & Permissions',
    href: '/roles',
    icon: '🛡️',
  },
  {
    label: 'Audit Logs',
    href: '/audit',
    icon: '📋',
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: '⚙️',
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  /**
   * Handle logout.
   *
   * Authentication state is managed centrally by AuthContext.
   *
   * AuthContext.logout() is responsible for:
   * - Calling the backend logout endpoint.
   * - Clearing access and refresh tokens.
   * - Clearing authentication cookies.
   * - Clearing local authentication state.
   * - Cancelling session timers.
   * - Redirecting the user to the public landing page.
   */
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <aside
      style={{
        width: '250px',
        minHeight: '100vh',
        background: '#111827',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1000,
      }}
    >
      {/* Application branding */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid #374151',
        }}
      >
        <div
          style={{
            fontSize: '20px',
            fontWeight: 700,
          }}
        >
          PeopleFirst
        </div>

        <div
          style={{
            fontSize: '13px',
            color: '#9CA3AF',
            marginTop: '4px',
          }}
        >
          Politician
        </div>
      </div>

      {/* Main navigation */}
      <nav
        style={{
          flex: 1,
          padding: '20px 12px',
        }}
      >
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' &&
              pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                marginBottom: '6px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive ? '#ffffff' : '#D1D5DB',
                background: isActive ? '#2563EB' : 'transparent',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <span style={{ fontSize: '18px' }}>
                {item.icon}
              </span>

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div
        style={{
          padding: '16px 12px',
          borderTop: '1px solid #374151',
        }}
      >
        <button
          type="button"
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 14px',
            border: 'none',
            borderRadius: '8px',
            background: 'transparent',
            color: '#D1D5DB',
            cursor: 'pointer',
            fontSize: '14px',
            textAlign: 'left',
          }}
        >
          <span style={{ fontSize: '18px' }}>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}