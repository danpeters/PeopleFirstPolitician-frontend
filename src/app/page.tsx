/**
 * ============================================================
 * File: C:\Projects\PeopleFirstPolitician\frontend\src\app\page.tsx
 *
 * Purpose:
 * - Home page / landing page
 * - Provides the public entry point to PeopleFirst Politician
 * - Displays application branding and version
 * ============================================================
 */

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f4ff',
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <section
        style={{
          background: '#ffffff',
          padding: '44px 40px 40px',
          borderRadius: '14px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.10)',
          textAlign: 'center',
          maxWidth: '480px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* People First Politician Logo */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '20px',
          }}
        >
          <img
            src="/people-first-politician-logo.png"
            alt="People First Politician"
            style={{
              width: '180px',
              height: 'auto',
              display: 'block',
            }}
          />
        </div>

        {/* Application Name */}
        <h1
          style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1a202c',
            margin: '0 0 8px',
          }}
        >
          PeopleFirst Politician
        </h1>

        {/* Description */}
        <p
          style={{
            color: '#4a5568',
            margin: '0 auto 16px',
            fontSize: '16px',
            lineHeight: '1.6',
            maxWidth: '380px',
          }}
        >
          Political engagement and campaign management platform
        </p>

        {/* Application Version */}
        <p
          style={{
            color: '#718096',
            margin: '0 0 28px',
            fontSize: '13px',
          }}
        >
          Version 1.0.0
        </p>

        {/* Get Started */}
        <a
          href="/login"
          style={{
            display: 'inline-block',
            padding: '13px 34px',
            background: '#4299e1',
            color: '#ffffff',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '16px',
          }}
        >
          Get Started
        </a>
      </section>
    </main>
  );
}