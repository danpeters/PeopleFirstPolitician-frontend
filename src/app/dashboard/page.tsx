/**
 * ============================================================
 * File: C:\Projects\PeopleFirstPolitician\frontend\src\app\dashboard\page.tsx
 *
 * Purpose:
 * - Main dashboard page (protected route)
 * - Displays user information and quick actions
 *
 * Why this file exists:
 * - "/dashboard" route maps to this file
 * - Central hub after login
 *
 * Security Features:
 * - Requires authentication (to be enforced by middleware)
 * - Logout clears all tokens
 * - No sensitive data stored in client
 * - Inline styles (no CSS injection)
 *
 * Design Notes:
 * - Header with logout
 * - Welcome card
 * - Quick action links
 * ============================================================
 */

'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function DashboardPage() {
  const router = useRouter();
  // Obtain the central logout function from AuthContext.
  const { logout } = useAuth();


  /**
 * Handle logout.
 *
 * Authentication state is managed centrally by AuthContext.
 *
 * This is important because authentication information exists
 * in more than one place:
 *
 * - React authentication state
 * - Access-token cookie used by Next.js middleware
 * - Local development storage
 *
 * AuthContext.logout() clears the complete authentication state
 * and redirects the user to the login page.
 */
const handleLogout = async () => {
  try {
    // Delegate logout to the central authentication service.
    await logout();
  } catch (error) {
    // Logout should still be completed even if the server-side
    // logout request encounters an error.
    console.error('Logout error:', error);
  }
};

  
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f7fafc',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Header */}
      <header
        style={{
          background: 'white',
          padding: '16px 32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1a202c',
          }}
        >
          Dashboard
        </h1>

        
      </header>

      {/* Main Content */}
      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '24px',
        }}
      >
        {/* Welcome Card */}
        <div
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '24px',
          }}
        >
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1a202c',
              marginBottom: '8px',
            }}
          >
            Welcome to PeopleFirst Politician
          </h2>
          <p style={{ color: '#4a5568' }}>
            You have successfully logged in to the platform.
          </p>
        </div>

        {/* Quick Actions */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
          }}
        >
          <a
            href="/users"
            style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'block',
              transition: 'box-shadow 0.2s',
            }}
          >
            <h3
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#4299e1',
                marginBottom: '4px',
              }}
            >
              👥 Manage Users
            </h3>
            <p style={{ color: '#4a5568', fontSize: '14px' }}>
              View and manage system users
            </p>
          </a>

          <a
            href="/roles"
            style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'block',
              transition: 'box-shadow 0.2s',
            }}
          >
            <h3
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#48bb78',
                marginBottom: '4px',
              }}
            >
              🛡️ Manage Roles
            </h3>
            <p style={{ color: '#4a5568', fontSize: '14px' }}>
              Configure roles and permissions
            </p>
          </a>

          <a
            href="/audit"
            style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'block',
              transition: 'box-shadow 0.2s',
            }}
          >
            <h3
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#9f7aea',
                marginBottom: '4px',
              }}
            >
              📋 Audit Logs
            </h3>
            <p style={{ color: '#4a5568', fontSize: '14px' }}>
              View system activity logs
            </p>
          </a>
        </div>
      </main>
    </div>
  );
}