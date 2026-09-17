/**
 * ============================================================
 * File: C:\Projects\PeopleFirstPolitician\frontend\src\app\page.tsx
 *
 * Purpose:
 * - Home page (landing page)
 * - Provides entry point to the application
 *
 * Why this file exists:
 * - Next.js App Router uses page.tsx for routes
 * - "/" route maps to this file
 *
 * Security Features:
 * - Uses inline styles (no CSS injection risk)
 * - No external resources loaded
 * - Static content (no data fetching)
 * - Clean link structure
 *
 * Design Notes:
 * - Uses inline styles for portability
 * - Centered card layout
 * - Clear call-to-action button
 * ============================================================
 */

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f4ff',
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '450px',
          width: '100%',
        }}
      >
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1a202c',
            marginBottom: '8px',
          }}
        >
          PeopleFirst Politician
        </h1>

        <p
          style={{
            color: '#4a5568',
            marginBottom: '24px',
            fontSize: '16px',
          }}
        >
          Political engagement and campaign management platform
        </p>

        <a
          href="/login"
          style={{
            display: 'inline-block',
            padding: '12px 32px',
            background: '#4299e1',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '16px',
            transition: 'background 0.2s',
          }}
        >
          Get Started
        </a>
      </div>
    </div>
  );
}