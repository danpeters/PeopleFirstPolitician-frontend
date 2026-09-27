/**
 * ============================================================
 * File: C:\Projects\PeopleFirstPolitician\frontend\src\app\dashboard\page.tsx
 *
 * Purpose:
 * - Main dashboard page for authenticated users.
 * - Displays the welcome message.
 * - Displays administrative quick-action cards according
 *   to the authenticated user's role.
 *
 * Security:
 * - The dashboard does not grant permissions by itself.
 * - Backend RBAC remains the authoritative security layer.
 * - Quick-action cards are hidden when the user's role does
 *   not have access to the corresponding feature.
 *
 * Dashboard visibility rules:
 * - SUPER_ADMIN:
 *     Manage Users
 *     Manage Roles
 *     Audit Logs
 *
 * - CAMPAIGN_MANAGER:
 *     Manage Users
 *     Audit Logs
 *
 * - ANALYST:
 *     Audit Logs
 *
 * - USER:
 *     No administrative quick-action cards
 *
 * ============================================================
 */

'use client';

import { useAuth } from '@/contexts/auth-context';

export default function DashboardPage() {
  /**
   * AuthContext provides the authenticated user and the
   * central role-checking function.
   *
   * hasRole() is preferable to manually checking role strings
   * throughout the application because the role logic remains
   * centralised in AuthContext.
   */
  const { hasRole } = useAuth();

  /**
   * Determine which dashboard cards the current user may see.
   *
   * IMPORTANT:
   * These checks control UI visibility only.
   * Actual authorisation is still enforced by the backend.
   */
  const canManageUsers = hasRole(['super_admin', 'campaign_manager']);

  const canManageRoles = hasRole('super_admin');

  const canViewAuditLogs = hasRole([
    'super_admin',
    'campaign_manager',
    'analyst',
  ]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f7fafc',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* ======================================================
          Page Header
          ====================================================== */}
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

      {/* ======================================================
          Main Content
          ====================================================== */}
      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '24px',
        }}
      >
        {/* ====================================================
            Welcome Card
            ==================================================== */}
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

        {/* ====================================================
            Administrative Quick Actions

            Cards are rendered conditionally according to the
            authenticated user's role.
            ==================================================== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
          }}
        >
          {/* ==================================================
              Manage Users

              Available to:
              - super_admin
              - campaign_manager
              ================================================== */}
          {canManageUsers && (
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

              <p
                style={{
                  color: '#4a5568',
                  fontSize: '14px',
                }}
              >
                View and manage system users
              </p>
            </a>
          )}

          {/* ==================================================
              Manage Roles

              Available to:
              - super_admin
              ================================================== */}
          {canManageRoles && (
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

              <p
                style={{
                  color: '#4a5568',
                  fontSize: '14px',
                }}
              >
                Configure roles and permissions
              </p>
            </a>
          )}

          {/* ==================================================
              Audit Logs

              Available to:
              - super_admin
              - campaign_manager
              - analyst
              ================================================== */}
          {canViewAuditLogs && (
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

              <p
                style={{
                  color: '#4a5568',
                  fontSize: '14px',
                }}
              >
                View system activity logs
              </p>
            </a>
          )}
        </div>
      </main>
    </div>
  );
}