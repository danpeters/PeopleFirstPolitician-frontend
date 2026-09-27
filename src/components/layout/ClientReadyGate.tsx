/**
 * File:
 * C:\Projects\PeopleFirstPolitician\frontend\src\components\layout\ClientReadyGate.tsx
 *
 * Purpose:
 * Prevent an unstyled flash of Next.js page content during the initial
 * browser hydration process.
 *
 * Problem addressed:
 * Some public pages use component-scoped styling. During development,
 * the browser can briefly display the server-rendered HTML before the
 * client-side styles have finished attaching. This can produce a short
 * "raw HTML" screen before the correctly styled page appears.
 *
 * Behaviour:
 * - Server render: display a small branded loading screen.
 * - Initial client render: keep the loading screen visible.
 * - After hydration: reveal the real application.
 *
 * Security:
 * - This component does not affect authentication or authorisation.
 * - It only controls the visual transition during initial hydration.
 */

'use client';

import {
  ReactNode,
  useEffect,
  useState,
} from 'react';

interface ClientReadyGateProps {
  children: ReactNode;
}

export default function ClientReadyGate({
  children,
}: ClientReadyGateProps) {
  /**
   * Keep the application hidden until React has completed
   * the initial client-side hydration.
   */
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    /**
     * At this point the browser has hydrated the component tree.
     * The application's real styled content can now be displayed.
     */
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div
        aria-label="Loading People First Politician"
        role="status"
        style={{
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
          color: '#123456',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '58px',
              height: '58px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background:
                'linear-gradient(135deg, #1261a0 0%, #1684d8 100%)',
              color: '#ffffff',
              fontSize: '20px',
              fontWeight: 800,
              letterSpacing: '0.5px',
              boxShadow:
                '0 10px 24px rgba(18, 97, 160, 0.20)',
            }}
          >
            PF
          </div>

          <div
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: '#123456',
            }}
          >
            People First Politician
          </div>

          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border:
                '3px solid rgba(18, 97, 160, 0.18)',
              borderTopColor: '#1261a0',
              animation:
                'people-first-loading-spin 0.8s linear infinite',
            }}
          />

          <style>{`
            @keyframes people-first-loading-spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
