/**
 * File: C:\Projects\PeopleFirstPolitician\frontend\src\app\register\page.tsx
 *
 * Purpose:
 * - Provides the public registration page for PeopleFirst Politician.
 * - Allows new users to create a standard platform account.
 *
 * Improvements:
 * - Password show/hide controls.
 * - Clear password requirements.
 * - Live password validation.
 * - Password confirmation validation.
 * - Improved user guidance.
 * - Mobile-friendly form controls.
 */

'use client';

import React, { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function RegisterPage() {
  const router = useRouter();
  const { register, login } = useAuth();

  // ============================================================
  // FORM STATE
  // ============================================================

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ============================================================
  // UI STATE
  // ============================================================

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // ============================================================
  // PASSWORD REQUIREMENTS
  // These match the backend validation requirements.
  // ============================================================

  const passwordRequirements = {
    minLength: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
  };

  const passwordIsValid =
    passwordRequirements.minLength &&
    passwordRequirements.lowercase &&
    passwordRequirements.uppercase &&
    passwordRequirements.number;

  const passwordsMatch =
    confirmPassword.length > 0 &&
    password === confirmPassword;

  // ============================================================
  // VALIDATION MESSAGE
  // ============================================================

  const getPasswordError = () => {
    const missing: string[] = [];

    if (!passwordRequirements.minLength) {
      missing.push('at least 8 characters');
    }

    if (!passwordRequirements.uppercase) {
      missing.push('one uppercase letter');
    }

    if (!passwordRequirements.lowercase) {
      missing.push('one lowercase letter');
    }

    if (!passwordRequirements.number) {
      missing.push('one number');
    }

    if (missing.length === 0) {
      return '';
    }

    return `Password must contain ${missing.join(', ')}.`;
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setErrorMessage('');

    // ----------------------------------------------------------
    // Validate password
    // ----------------------------------------------------------

    if (!passwordIsValid) {
      setErrorMessage(getPasswordError());
      return;
    }

    // ----------------------------------------------------------
    // Validate password confirmation
    // ----------------------------------------------------------

    if (password !== confirmPassword) {
      setErrorMessage(
        'Password and confirmation do not match.',
      );
      return;
    }

    // ----------------------------------------------------------
    // Validate all required fields
    // ----------------------------------------------------------

    if (!fullName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Email address is required.');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Phone number is required.');
      return;
    }

    if (!password) {
      setErrorMessage('Password is required.');
      return;
    }

    if (!confirmPassword) {
      setErrorMessage('Please confirm your password.');
      return;
    }

    // ----------------------------------------------------------
    // Validate Nigerian phone number
    // ----------------------------------------------------------

    const phoneRegex = /^\d{11}$/;

    if (!phoneRegex.test(phone.trim())) {
      setErrorMessage(
        'Phone number must contain exactly 11 digits.',
      );
      return;
    }

    // ----------------------------------------------------------
    // Prevent duplicate submissions
    // ----------------------------------------------------------

    setIsSubmitting(true);

    try {
      await register(
        fullName.trim(),
        email.trim(),
        phone.trim(),
        password,
        confirmPassword,
      );

      // Automatically log the newly registered user in.
      await login(
        email.trim().toLowerCase(),
        password,
        false,
      );

      // Take the authenticated user directly to the dashboard.
      router.push('/dashboard');
    } catch (error: any) {
      setErrorMessage(
        error?.message ||
          'Registration failed. Please check your details and try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // PASSWORD REQUIREMENT COMPONENT
  // ============================================================

  const Requirement = ({
    valid,
    children,
  }: {
    valid: boolean;
    children: React.ReactNode;
  }) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.25rem',
        color: valid ? '#166534' : '#6b7280',
        fontSize: '0.875rem',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          fontWeight: 700,
          width: '18px',
          textAlign: 'center',
        }}
      >
        {valid ? '✓' : '○'}
      </span>

      <span>{children}</span>
    </div>
  );

  // ============================================================
  // PASSWORD FIELD STYLE
  // ============================================================

  const passwordInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.85rem 3rem 0.85rem 0.85rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    outline: 'none',
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: '#f4f7fb',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#ffffff',
          borderRadius: '12px',
          padding: 'clamp(1.25rem, 5vw, 2.5rem)',
          boxShadow:
            '0 8px 30px rgba(0, 0, 0, 0.08)',
          boxSizing: 'border-box',
        }}
      >
        {/* ======================================================
            HEADER
        ======================================================= */}

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

        {/* ======================================================
            ERROR MESSAGE
        ======================================================= */}

        {errorMessage && (
          <div
            role="alert"
            style={{
              marginBottom: '1.5rem',
              padding: '0.9rem 1rem',
              borderRadius: '8px',
              background: '#fee2e2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              lineHeight: 1.5,
            }}
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ====================================================
              FULL NAME
          ===================================================== */}

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
              Full Name <span style={{ color: '#dc2626' }}>*</span>
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
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* ====================================================
              EMAIL
          ===================================================== */}

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
              Email Address <span style={{ color: '#dc2626' }}>*</span>
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
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* ====================================================
              PHONE
          ===================================================== */}

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
              Phone Number <span style={{ color: '#dc2626' }}>*</span>
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={(event) => {
                const value = event.target.value.replace(/\D/g, '');

                if (value.length <= 11) {
                  setPhone(value);
                }
              }}
              placeholder="e.g. 08012345678"
              autoComplete="tel"
              inputMode="numeric"
              maxLength={11}
              minLength={11}
              pattern="[0-9]{11}"
              required
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.85rem',
                border: '1px solid #d1d5db',
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
              Enter your 11-digit Nigerian mobile phone number.
            </small>
          </div>

          {/* ====================================================
              PASSWORD
          ===================================================== */}

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
              Password <span style={{ color: '#dc2626' }}>*</span>
            </label>

            {/* Password input + eye button */}

            <div
              style={{
                position: 'relative',
              }}
            >
              <input
                id="password"
                name="password"
                type={
                  showPassword ? 'text' : 'password'
                }
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Create a password"
                autoComplete="new-password"
                required
                minLength={8}
                disabled={isSubmitting}
                style={passwordInputStyle}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
                title={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
                disabled={isSubmitting}
                style={{
                  position: 'absolute',
                  right: '0.65rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: '0.25rem',
                }}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>

            {/* Password guidance */}

            <div
              style={{
                marginTop: '0.75rem',
                padding: '0.75rem',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: '0.875rem',
                  marginBottom: '0.4rem',
                }}
              >
                Password requirements:
              </div>

              <Requirement
                valid={passwordRequirements.minLength}
              >
                At least 8 characters
              </Requirement>

              <Requirement
                valid={passwordRequirements.uppercase}
              >
                At least one uppercase letter (A–Z)
              </Requirement>

              <Requirement
                valid={passwordRequirements.lowercase}
              >
                At least one lowercase letter (a–z)
              </Requirement>

              <Requirement
                valid={passwordRequirements.number}
              >
                At least one number (0–9)
              </Requirement>
            </div>
          </div>

          {/* ====================================================
              CONFIRM PASSWORD
          ===================================================== */}

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
              Confirm Password <span style={{ color: '#dc2626' }}>*</span>
            </label>

            <div
              style={{
                position: 'relative',
              }}
            >
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={
                  showConfirmPassword
                    ? 'text'
                    : 'password'
                }
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value,
                  )
                }
                placeholder="Re-enter your password"
                autoComplete="new-password"
                required
                minLength={8}
                disabled={isSubmitting}
                style={{
                  ...passwordInputStyle,
                  border:
                    confirmPassword.length > 0 &&
                    !passwordsMatch
                      ? '1px solid #dc2626'
                      : passwordsMatch
                        ? '1px solid #16a34a'
                        : '1px solid #d1d5db',
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword,
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? 'Hide confirmation password'
                    : 'Show confirmation password'
                }
                title={
                  showConfirmPassword
                    ? 'Hide password'
                    : 'Show password'
                }
                disabled={isSubmitting}
                style={{
                  position: 'absolute',
                  right: '0.65rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: '0.25rem',
                }}
              >
                {showConfirmPassword ? '🙈' : '👁'}
              </button>
            </div>

            {confirmPassword.length > 0 && (
              <small
                style={{
                  display: 'block',
                  marginTop: '0.4rem',
                  color: passwordsMatch
                    ? '#166534'
                    : '#991b1b',
                  fontWeight: 500,
                }}
              >
                {passwordsMatch
                  ? '✓ Passwords match.'
                  : 'Passwords do not match.'}
              </small>
            )}
          </div>

          {/* ====================================================
              SUBMIT
          ===================================================== */}

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

        {/* ======================================================
            LOGIN LINK
        ======================================================= */}

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

        {/* ======================================================
            HOME LINK
        ======================================================= */}

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