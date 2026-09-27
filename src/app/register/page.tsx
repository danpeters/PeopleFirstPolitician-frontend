
/**
 * File: C:\Projects\PeopleFirstPolitician\frontend\src\app\register\page.tsx
 *
 * Purpose:
 * - Provides the public registration page for PeopleFirst Politician.
 * - Allows new users to create a standard platform account.
 *
 * Responsibilities:
 * - Collect full name.
 * - Collect email address.
 * - Collect phone number.
 * - Collect password.
 * - Collect password confirmation.
 * - Submit registration through AuthContext.
 * - Display registration errors.
 * - Redirect the newly registered user to the login page.
 * - Provides a Back to Home link for users who cancel registration.
 *
 * Security:
 * - Does not expose a role-selection field.
 * - The backend assigns the standard USER role.
 * - Password confirmation is checked before submission.
 * - Password values are not stored outside the component state.
 * - Registration is submitted through the central authentication context.
 */

'use client';

import React, { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  /**
   * Registration form state.
   */
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  /**
   * UI state.
   */
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState('');

  /**
   * Submit registration form.
   */
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setErrorMessage('');

    /**
     * Client-side password confirmation check.
     */
    if (password !== confirmPassword) {
      setErrorMessage(
        'Password and confirmation do not match.',
      );
      return;
    }

    /**
     * Prevent duplicate submissions.
     */
    setIsSubmitting(true);

    try {
      /**
       * Register the new public user.
       *
       * No role is supplied here.
       * The backend automatically assigns the standard
       * USER role.
       */
      await register(
        fullName,
        email,
        phone,
        password,
        confirmPassword,
      );

      /**
       * Registration does not automatically log the user in.
       *
       * Send the newly registered user to the login page.
       */
      router.push('/login');
    } catch (error: any) {
      /**
       * Display the backend validation/error message.
       */
      setErrorMessage(
        error?.message ||
          'Registration failed. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: '#f4f7fb',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#ffffff',
          borderRadius: '12px',
          padding: '2.5rem',
          boxShadow:
            '0 8px 30px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: '2rem',
          }}
        >
          <h1
            style={{
              marginBottom: '0.5rem',
              fontSize: '2rem',
              fontWeight: 700,
              color: '#111827',
            }}
          >
            Create Your Account
          </h1>

          <p
            style={{
              margin: 0,
              color: '#4b5563',
              fontSize: '1rem',
            }}
          >
            Join PeopleFirst Politician
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            style={{
              marginBottom: '1.5rem',
              padding: '0.9rem 1rem',
              borderRadius: '8px',
              background: '#fee2e2',
              color: '#991b1b',
              border:
                '1px solid #fecaca',
            }}
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="fullName"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 600,
                color: '#111827',
              }}
            >
              Full Name
            </label>

            <input
              id="fullName"
              name="fullName"
              type="text"
              value={fullName}
              onChange={(event) =>
                setFullName(event.target.value)
              }
              placeholder="Enter your full name"
              autoComplete="name"
              required
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.85rem',
                border:
                  '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 600,
                color: '#111827',
              }}
            >
              Email Address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email address"
              autoComplete="email"
              required
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.85rem',
                border:
                  '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Phone */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="phone"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 600,
                color: '#111827',
              }}
            >
              Phone Number
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              placeholder="Enter your phone number"
              autoComplete="tel"
              required
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.85rem',
                border:
                  '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 600,
                color: '#111827',
              }}
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Create a password"
              autoComplete="new-password"
              required
              minLength={8}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.85rem',
                border:
                  '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box',
              }}
            />

            <small
              style={{
                display: 'block',
                marginTop: '0.4rem',
                color: '#6b7280',
              }}
            >
              Minimum 8 characters.
            </small>
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="confirmPassword"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 600,
                color: '#111827',
              }}
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value,
                )
              }
              placeholder="Confirm your password"
              autoComplete="new-password"
              required
              minLength={8}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.85rem',
                border:
                  '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '0.9rem',
              border: 'none',
              borderRadius: '8px',
              background: isSubmitting
                ? '#9ca3af'
                : '#3b82f6',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: isSubmitting
                ? 'not-allowed'
                : 'pointer',
            }}
          >
            {isSubmitting
              ? 'Creating Account...'
              : 'Create Account'}
          </button>
        </form>

        <div
          style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            color: '#4b5563',
          }}
        >
          <span>Already have an account? </span>

          <Link
            href="/login"
            style={{
              color: '#2563eb',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Sign In
          </Link>
        </div>
        {/* ============================================================
            NAVIGATION
            Gives a user who changes their mind a clear way to leave
            the registration process and return to the home page.
        ============================================================= */}
        <div
          style={{
            marginTop: '1.5rem',
            textAlign: 'center',
          }}
        >
          <Link
            href="/"
            style={{
              color: '#1261a0',
              fontSize: '0.875rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            ← Back to Home
          </Link>
        </div>

      </section>
    </main>
  );
}
