/**
 * File:
 * C:\Projects\PeopleFirstPolitician\frontend\src\app\layout.tsx
 *
 * Purpose:
 * Root layout for the People First Politician frontend.
 *
 * Responsibilities:
 * - Loads global application styles.
 * - Provides the authentication context.
 * - Provides the application shell.
 * - Prevents an unstyled page flash during initial hydration.
 */

import type { Metadata } from 'next';

import './globals.css';

import { AuthProvider } from '@/contexts/auth-context';
import AppShell from '@/components/layout/AppShell';
import ClientReadyGate from '@/components/layout/ClientReadyGate';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'PeopleFirst Politician',
  description: 'Political engagement platform',
  icons: {
    icon: '/people-first-politician-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
  <html lang="en">
    <body className="antialiased">
      {/*
       * ClientReadyGate prevents the browser from briefly showing
       * unstyled server-rendered markup while Next.js hydrates
       * the client components and attaches their styles.
       */}
      <ClientReadyGate>
        <AuthProvider>
          <AppShell>
            {children}
          </AppShell>
        </AuthProvider>
      </ClientReadyGate>

      <Toaster />
    </body>
  </html>
);
}
