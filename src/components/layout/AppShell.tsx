// File: C:\Projects\PeopleFirstPolitician\frontend\src\components\layout\AppShell.tsx

'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Application shell.
 *
 * Purpose:
 * - Provides the authenticated application's common layout.
 * - Displays the Sidebar only on authenticated application pages.
 * - Keeps public pages such as the landing page and login page clean.
 *
 * Public routes:
 * - /
 * - /login
 */
export default function AppShell({
  children,
}: AppShellProps) {
  const pathname = usePathname();

  const isPublicRoute =
    pathname === '/' ||
    pathname === '/login';

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />

      <main
        style={{
          marginLeft: '250px',
          minHeight: '100vh',
        }}
      >
        {children}
      </main>
    </>
  );
}