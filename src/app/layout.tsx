// File: C:\Projects\PeopleFirstPolitician\frontend\src\app\layout.tsx

import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'PeopleFirst Politician',
  description: 'Political engagement platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}