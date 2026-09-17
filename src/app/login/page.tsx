/**
 * ============================================================
 * File:
 * C:\Projects\PeopleFirstPolitician\frontend\src\app\login\page.tsx
 *
 * Purpose:
 * - Provides the user login interface.
 * - Collects the user's email address and password.
 * - Sends authentication requests through AuthContext.
 * - Redirects successfully authenticated users to the dashboard.
 *
 * Authentication Flow:
 *   Login Form
 *       ↓
 *   AuthContext.login()
 *       ↓
 *   API Client
 *       ↓
 *   POST /api/v1/auth/login
 *       ↓
 *   NestJS Authentication Service
 *       ↓
 *   JWT Access Token
 *       ↓
 *   AuthContext stores authentication state
 *       ↓
 *   Dashboard
 *
 * Security Features:
 * - Password is never stored in localStorage by this component.
 * - Password is cleared after every submission attempt.
 * - Email validation is performed by the browser.
 * - Password must contain at least 8 characters.
 * - Generic authentication error messages are displayed.
 * - Submit button is disabled while authentication is in progress.
 * - Authentication logic is delegated to AuthContext rather than
 *   being duplicated inside the login page.
 *
 * Design:
 * - Existing visual design is intentionally preserved.
 * - Inline styles are retained.
 * - No external fonts are loaded.
 * ============================================================
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function LoginPage() {
  // ----------------------------------------------------------
  // Form state
  // ----------------------------------------------------------

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ----------------------------------------------------------
  // UI state
  // ----------------------------------------------------------

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ----------------------------------------------------------
  // Next.js router
  // ----------------------------------------------------------

  const router = useRouter();

  // ----------------------------------------------------------
  // Authentication context
  //
  // The AuthContext contains the actual authentication logic.
  // It communicates with the NestJS backend through api-client.ts.
  // ----------------------------------------------------------

  const { login } = useAuth();

  /**
   * Handle login form submission.
   *
   * Authentication flow:
   *
   * 1. Prevent the browser's normal form submission.
   * 2. Clear any previous error.
   * 3. Validate that the required fields are present.
   * 4. Call AuthContext.login().
   * 5. AuthContext sends the credentials to:
   *
   *      POST /api/v1/auth/login
   *
   * 6. If authentication succeeds, redirect to /dashboard.
   * 7. If authentication fails, display a generic error.
   * 8. Always clear the password from this component's state.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear any error from a previous attempt.
    setError('');

    // Basic client-side validation.
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError('Please enter your email address and password.');
      return;
    }

    setLoading(true);

    try {
      /**
       * Delegate authentication to AuthContext.
       *
       * AuthContext is responsible for:
       * - Calling the backend API.
       * - Processing the JWT access token.
       * - Updating the authenticated user state.
       * - Handling authentication-related notifications.
       */
      await login(trimmedEmail, password);

      /**
       * Authentication succeeded.
       *
       * Navigate to the protected dashboard.
       */
      router.push('/dashboard');
    } catch (err) {
      /**
       * Do not expose detailed authentication information.
       *
       * A generic message also helps prevent user enumeration.
       */
      setError('Login failed. Please check your credentials.');
    } finally {
      /**
       * Always clear the password from this component's state
       * after the authentication attempt.
       */
      setPassword('');

      // Re-enable the form.
      setLoading(false);
    }
  };

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
          maxWidth: '400px',
          width: '100%',
        }}
      >
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#1a202c',
            marginBottom: '4px',
          }}
        >
          Welcome Back
        </h1>

        <p
          style={{
            textAlign: 'center',
            color: '#4a5568',
            marginBottom: '24px',
            fontSize: '14px',
          }}
        >
          Sign in to your account
        </p>

        {/* ----------------------------------------------------
            Authentication error message
            ---------------------------------------------------- */}
        {error && (
          <div
            role="alert"
            style={{
              padding: '10px',
              background: '#fed7d7',
              color: '#c53030',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* --------------------------------------------------
              Email Field
              -------------------------------------------------- */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#2d3748',
                marginBottom: '4px',
              }}
            >
              Email Address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="admin@example.com"
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>

          {/* --------------------------------------------------
              Password Field
              -------------------------------------------------- */}
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#2d3748',
                marginBottom: '4px',
              }}
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              minLength={8}
              disabled={loading}
            />
          </div>

          {/* --------------------------------------------------
              Submit Button
              -------------------------------------------------- */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#a0aec0' : '#4299e1',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}