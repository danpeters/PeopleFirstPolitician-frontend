/**
 * File:
 * C:\Projects\PeopleFirstPolitician\frontend\src\app\reset-password\page.tsx
 *
 * Purpose:
 * - Provides the password-reset form for users who received a
 *   valid password-reset email.
 * - Reads the temporary reset token from the URL.
 * - Validates the new password and confirmation.
 * - Submits the reset request to the backend.
 * - Displays success and error states.
 * - Provides navigation back to the login page.
 *
 * Security:
 * - The reset token is read only from the URL.
 * - The token is never displayed to the user.
 * - The token is never logged to the console.
 * - Password values are kept only in component state.
 * - The backend remains responsible for validating the token,
 *   checking expiry, hashing the password, and invalidating the token.
 */

'use client';

import React, { FormEvent, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

export default function ResetPasswordPage() {
  /**
   * Password-reset tokens are temporary credentials.
   *
   * The token is deliberately read from the current browser URL
   * at the moment the form is submitted. It is never logged or
   * displayed by this page.
   */

  

  /**
   * Temporary password-reset token supplied by the email link.
   *
   * Important:
   * Do not log or display this value.
   */
  

  /**
   * Form state.
   */
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  /**
   * UI state.
   */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  /**
   * Live password requirement checks.
   *
   * These values are recalculated whenever the user types, so the
   * requirement indicators can visibly change from incomplete to
   * complete.
   */
  const passwordRequirements = {
    length: newPassword.length >= 12,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  };

  /**
   * Submit password-reset request.
   */
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    /**
     * Read the temporary reset token directly from the current
     * browser URL.
     *
     * Expected URL:
     * /reset-password?token=<temporary-token>
     *
     * The actual token is never logged or displayed.
     */
    const resetToken =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('token')?.trim() || ''
        : '';

    /**
     * Make sure the email link contains a reset token.
     */
    if (!resetToken) {
      setErrorMessage(
        'This password-reset link is invalid or incomplete. Please request a new reset link.',
      );
      return;
    }

    /**
     * Validate password confirmation.
     */
    if (newPassword !== confirmPassword) {
      setErrorMessage(
        'New password and confirmation do not match.',
      );
      return;
    }

    /**
     * Validate minimum password length.
     *
     * We use 12 characters here to provide stronger password
     * protection than the backend minimum of 8 characters.
     */
    if (newPassword.length < 12) {
      setErrorMessage(
        'Your new password must be at least 12 characters long.',
      );
      return;
    }

    /**
     * Validate password complexity.
     */
    if (!/[A-Z]/.test(newPassword)) {
      setErrorMessage(
        'Your new password must contain at least one uppercase letter.',
      );
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setErrorMessage(
        'Your new password must contain at least one lowercase letter.',
      );
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setErrorMessage(
        'Your new password must contain at least one number.',
      );
      return;
    }

    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      setErrorMessage(
        'Your new password must contain at least one special character.',
      );
      return;
    }

    setIsSubmitting(true);

    try {
      /**
       * Development-only diagnostic.
       *
       * This reports only whether a token was found. The token
       * itself is never printed to the console.
       */
      if (process.env.NODE_ENV === 'development') {
        console.log(
          'Password reset token detected:',
          Boolean(resetToken),
        );
      }

      /**
       * Send the reset request to the NestJS backend.
       *
       * The token is sent only to the backend and is never
       * written to the console or displayed on the page.
       */
      const response = await apiClient.post(
        '/auth/reset-password',
        {
          token: resetToken,
          newPassword,
          confirmPassword,
        },
      );

      setSuccessMessage(
        response?.data?.message ||
          'Your password has been reset successfully.',
      );

      /**
       * Clear password values after successful reset.
       */
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Password reset error:', error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Unable to reset your password. The link may have expired. Please request a new reset link.';

      setErrorMessage(
        Array.isArray(message)
          ? message.join(', ')
          : String(message),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <main className="reset-page">
        <section className="reset-shell">

          {/* =====================================================
              BRANDING PANEL
             ===================================================== */}
          <aside className="brand-panel">
            <div className="brand-content">

              <div className="brand-mark">
                <span>PF</span>
              </div>

              <div className="brand-name">
                PeopleFirst
                <br />
                <strong>Politician</strong>
              </div>

              <div className="brand-divider" />

              <h2>
                Secure account
                <br />
                recovery
              </h2>

              <p>
                Create a new password and regain secure access
                to your PeopleFirst Politician account.
              </p>

              <div className="security-note">
                <span className="security-icon">✓</span>

                <div>
                  <strong>Secure reset</strong>
                  <small>
                    Your reset link is temporary and expires
                    after 30 minutes.
                  </small>
                </div>
              </div>
            </div>
          </aside>

          {/* =====================================================
              RESET FORM
             ===================================================== */}
          <section className="form-panel">

            <div className="form-container">

              <div className="eyebrow">
                ACCOUNT SECURITY
              </div>

              <h1>Reset Password</h1>

              <p className="intro">
                Enter and confirm your new password below.
              </p>

              {/* Success message */}
              {successMessage && (
                <div className="message success-message">
                  <span className="message-icon">✓</span>

                  <div>
                    <strong>Password reset successful</strong>
                    <p>{successMessage}</p>
                  </div>
                </div>
              )}

              {/* Error message */}
              {errorMessage && (
                <div className="message error-message">
                  <span className="message-icon">!</span>

                  <div>
                    <strong>Password reset unsuccessful</strong>
                    <p>{errorMessage}</p>
                  </div>
                </div>
              )}

              {!successMessage && (
                <form onSubmit={handleSubmit}>

                  {/* New password */}
                  <div className="field">
                    <label htmlFor="newPassword">
                      New password
                    </label>

                    <div className="password-wrapper">
                      <span className="field-icon">🔒</span>

                      <input
                        id="newPassword"
                        type={
                          showNewPassword
                            ? 'text'
                            : 'password'
                        }
                        value={newPassword}
                        onChange={(event) =>
                          setNewPassword(event.target.value)
                        }
                        placeholder="Enter your new password"
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        required
                      />

                      <button
                        type="button"
                        className="show-button"
                        onClick={() =>
                          setShowNewPassword(
                            (current) => !current,
                          )
                        }
                        aria-label={
                          showNewPassword
                            ? 'Hide password'
                            : 'Show password'
                        }
                      >
                        {showNewPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div className="field">
                    <label htmlFor="confirmPassword">
                      Confirm new password
                    </label>

                    <div className="password-wrapper">
                      <span className="field-icon">🔒</span>

                      <input
                        id="confirmPassword"
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
                        placeholder="Confirm your new password"
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        required
                      />

                      <button
                        type="button"
                        className="show-button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (current) => !current,
                          )
                        }
                        aria-label={
                          showConfirmPassword
                            ? 'Hide password'
                            : 'Show password'
                        }
                      >
                        {showConfirmPassword
                          ? 'Hide'
                          : 'Show'}
                      </button>
                    </div>
                  </div>

                  {/* Password requirements */}
                  <div className="requirements">
                    <div className="requirements-title">
                      Password requirements
                    </div>

                    <div
                      className={`requirement ${
                        passwordRequirements.length ? 'met' : ''
                      }`}
                    >
                      <span>
                        {passwordRequirements.length ? '✓' : '○'}
                      </span>
                      At least 12 characters
                    </div>

                    <div
                      className={`requirement ${
                        passwordRequirements.uppercase ? 'met' : ''
                      }`}
                    >
                      <span>
                        {passwordRequirements.uppercase ? '✓' : '○'}
                      </span>
                      At least one uppercase letter
                    </div>

                    <div
                      className={`requirement ${
                        passwordRequirements.lowercase ? 'met' : ''
                      }`}
                    >
                      <span>
                        {passwordRequirements.lowercase ? '✓' : '○'}
                      </span>
                      At least one lowercase letter
                    </div>

                    <div
                      className={`requirement ${
                        passwordRequirements.number ? 'met' : ''
                      }`}
                    >
                      <span>
                        {passwordRequirements.number ? '✓' : '○'}
                      </span>
                      At least one number
                    </div>

                    <div
                      className={`requirement ${
                        passwordRequirements.special ? 'met' : ''
                      }`}
                    >
                      <span>
                        {passwordRequirements.special ? '✓' : '○'}
                      </span>
                      At least one special character
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="reset-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner" />
                        Resetting password...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </form>
              )}

              {/* Navigation */}
              <div className="back-link-container">
                <Link
                  href="/login"
                  className="back-link"
                >
                  ← Back to Sign In
                </Link>
              </div>

              <div className="footer-note">
                PeopleFirst Politician
                <span>•</span>
                Secure Account Recovery
              </div>

            </div>
          </section>
        </section>
      </main>

      <style jsx>{`
        .reset-page {
          min-height: 100vh;
          background: #f4f7fb;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
          box-sizing: border-box;
        }

        .reset-shell {
          width: 100%;
          max-width: 1080px;
          min-height: 680px;
          display: grid;
          grid-template-columns: 42% 58%;
          background: #ffffff;
          border-radius: 18px;
          overflow: hidden;
          box-shadow:
            0 24px 60px rgba(15, 23, 42, 0.12),
            0 4px 14px rgba(15, 23, 42, 0.05);
        }

        .brand-panel {
          background: linear-gradient(
            145deg,
            #083b66 0%,
            #1261a0 55%,
            #1976b8 100%
          );
          color: #ffffff;
          padding: 58px 48px;
          display: flex;
          align-items: center;
        }

        .brand-content {
          width: 100%;
        }

        .brand-mark {
          width: 62px;
          height: 62px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .brand-mark span {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .brand-name {
          font-size: 26px;
          line-height: 1.15;
          font-weight: 400;
          letter-spacing: -0.5px;
        }

        .brand-name strong {
          font-weight: 800;
        }

        .brand-divider {
          width: 52px;
          height: 3px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 3px;
          margin: 34px 0;
        }

        .brand-panel h2 {
          margin: 0 0 18px;
          font-size: 34px;
          line-height: 1.18;
          font-weight: 750;
          letter-spacing: -0.8px;
        }

        .brand-panel p {
          margin: 0;
          max-width: 360px;
          font-size: 15px;
          line-height: 1.75;
          color: rgba(255, 255, 255, 0.82);
        }

        .security-note {
          margin-top: 42px;
          display: flex;
          align-items: flex-start;
          gap: 13px;
          padding: 16px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.14);
        }

        .security-icon {
          width: 25px;
          height: 25px;
          flex: 0 0 25px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          color: #1261a0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 800;
        }

        .security-note strong {
          display: block;
          font-size: 13px;
          margin-bottom: 3px;
        }

        .security-note small {
          display: block;
          font-size: 12px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.72);
        }

        .form-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 55px 64px;
          background: #ffffff;
        }

        .form-container {
          width: 100%;
          max-width: 470px;
        }

        .eyebrow {
          display: inline-block;
          padding: 8px 15px;
          border-radius: 999px;
          background: #eef6fd;
          color: #1261a0;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.8px;
          margin-bottom: 20px;
        }

        h1 {
          margin: 0;
          color: #092f54;
          font-size: 36px;
          line-height: 1.15;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .intro {
          margin: 13px 0 30px;
          color: #6b7f96;
          font-size: 15px;
          line-height: 1.7;
        }

        .message {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 15px;
          border-radius: 10px;
          margin-bottom: 22px;
          font-size: 13px;
          line-height: 1.5;
        }

        .message-icon {
          width: 25px;
          height: 25px;
          flex: 0 0 25px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .message strong {
          display: block;
          margin-bottom: 2px;
        }

        .message p {
          margin: 0;
        }

        .success-message {
          background: #ecfdf3;
          border: 1px solid #a7f3c4;
          color: #166534;
        }

        .success-message .message-icon {
          background: #22c55e;
          color: white;
        }

        .error-message {
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #9f1239;
        }

        .error-message .message-icon {
          background: #e11d48;
          color: white;
        }

        .field {
          margin-bottom: 20px;
        }

        .field label {
          display: block;
          margin-bottom: 8px;
          color: #25364a;
          font-size: 13px;
          font-weight: 700;
        }

        .password-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-icon {
          position: absolute;
          left: 15px;
          z-index: 2;
          font-size: 14px;
          opacity: 0.55;
        }

        .password-wrapper input {
          width: 100%;
          min-height: 52px;
          padding: 0 78px 0 43px;
          border: 1px solid #d5dfeb;
          border-radius: 10px;
          background: #fbfcfe;
          color: #1a2c40;
          font-size: 14px;
          box-sizing: border-box;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .password-wrapper input::placeholder {
          color: #9aabc0;
        }

        .password-wrapper input:focus {
          outline: none;
          border-color: #1261a0;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(18, 97, 160, 0.1);
        }

        .password-wrapper input:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .show-button {
          position: absolute;
          right: 12px;
          border: 0;
          background: transparent;
          color: #1261a0;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          padding: 6px;
        }

        .show-button:hover {
          text-decoration: underline;
        }

        .requirements {
          margin: 4px 0 24px;
          padding: 15px 16px;
          border-radius: 10px;
          background: #f7fafc;
          border: 1px solid #e5ebf2;
        }

        .requirements-title {
          color: #34465a;
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 9px;
        }

        .requirement {
          color: #687b90;
          font-size: 12px;
          line-height: 1.8;
        }

        .requirement span {
          display: inline-block;
          width: 18px;
          margin-right: 7px;
          color: #9aaabd;
          font-weight: 800;
          transition: color 0.2s ease;
        }

        .requirement.met {
          color: #16803c;
        }

        .requirement.met span {
          color: #16803c;
        }

        .reset-button {
          width: 100%;
          min-height: 52px;
          border: 0;
          border-radius: 10px;
          background: #1261a0;
          color: #ffffff;
          font-size: 14px;
          font-weight: 750;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          transition:
            background 0.2s ease,
            transform 0.1s ease,
            box-shadow 0.2s ease;
          box-shadow: 0 5px 14px rgba(18, 97, 160, 0.2);
        }

        .reset-button:hover:not(:disabled) {
          background: #0b4f87;
          box-shadow: 0 7px 18px rgba(18, 97, 160, 0.25);
        }

        .reset-button:active:not(:disabled) {
          transform: translateY(1px);
        }

        .reset-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .back-link-container {
          margin-top: 24px;
          text-align: center;
        }

        .back-link {
          color: #1261a0;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        .footer-note {
          margin-top: 30px;
          text-align: center;
          color: #a0adbb;
          font-size: 11px;
        }

        .footer-note span {
          margin: 0 7px;
        }

        @media (max-width: 850px) {
          .reset-page {
            padding: 18px;
          }

          .reset-shell {
            grid-template-columns: 1fr;
            max-width: 560px;
          }

          .brand-panel {
            padding: 35px 34px;
          }

          .brand-panel h2 {
            font-size: 28px;
          }

          .brand-divider,
          .security-note {
            margin-top: 22px;
            margin-bottom: 22px;
          }

          .form-panel {
            padding: 40px 34px;
          }
        }

        @media (max-width: 500px) {
          .reset-page {
            padding: 0;
          }

          .reset-shell {
            min-height: 100vh;
            border-radius: 0;
          }

          .brand-panel {
            padding: 30px 25px;
          }

          .form-panel {
            padding: 35px 25px;
          }

          h1 {
            font-size: 31px;
          }
        }
      `}</style>
    </>
  );
}